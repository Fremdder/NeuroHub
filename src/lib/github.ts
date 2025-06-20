import { db } from "@/server/db";
import { Octokit } from "octokit";
import { aisummariseCommit } from "./gemini";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

// 🔧 Utility to extract owner/repo safely
function extractOwnerRepo(githubUrl: string): [string, string] {
  const url = new URL(githubUrl);
  const [owner, repo] = url.pathname.replace(/^\/|\/$/g, "").split("/");
  if (!owner || !repo) throw new Error("Invalid GitHub URL");
  return [owner, repo];
}

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
  const [owner, repo] = extractOwnerRepo(githubUrl);

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort((a: any, b: any) =>
    new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()
  ) as any[];

  return sortedCommits.slice(0, 15).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit?.message ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit?.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));
};

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);

  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) => SummariesCommit(githubUrl, commit.commitHash))
  );

  const summarises = summaryResponses.map((response, index) => {
    if (response.status === "fulfilled") {
      return response.value;
    } else {
      console.error(`❌ Failed to summarize commit ${unprocessedCommits[index]?.commitHash}:`, response.reason);
      return "Summary not available";
    }
  });

  const commit = await db.commit.createMany({
    data: summarises.map((summary, index) => ({
      projectId: projectId,
      commitHash: unprocessedCommits[index]!.commitHash,
      commitMessage: unprocessedCommits[index]!.commitMessage,
      commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
      commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
      commitDate: unprocessedCommits[index]!.commitDate,
      summary,
    })),
  });

  return commit;
};

// ✅ Uses Octokit to fetch authenticated diff data
async function SummariesCommit(githubUrl: string, commitHash: string) {
  const [owner, repo] = extractOwnerRepo(githubUrl);

  const response = await octokit.request("GET /repos/{owner}/{repo}/commits/{ref}", {
    owner,
    repo,
    ref: commitHash,
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });

  const diffText = response.data as unknown as string;

  return (await aisummariseCommit(diffText)) || "Response Nahi aaya";
}


async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      githubUrl: true,
    },
  });

  if (!project?.githubUrl) {
    throw new Error("Project has no github url");
  }

  return { project, githubUrl: project.githubUrl };
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
  });

  const unprocessedCommits = commitHashes.filter(
    (commit) => !processedCommits.some((pc) => pc.commitHash === commit.commitHash)
  );

  return unprocessedCommits;
}
