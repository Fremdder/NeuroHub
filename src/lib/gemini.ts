import {GoogleGenerativeAI} from '@google/generative-ai'
import type { Document } from '@langchain/core/documents';

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genai.getGenerativeModel({
    model : 'gemini-2.5-flash'
})

export const aisummariseCommit = async (diff: string) => {
    const response = await model.generateContent(`
        You are an expert software engineer with deep experience in code review and version control. Your task is to create a concise, informative summary of a git diff that would be valuable for code reviewers and team members.
        
        ## Git Diff Format Reference:
        - **File headers**: Lines like \`diff --git a/file.js b/file.js\` indicate which files were modified
        - **Line indicators**: 
          - \`+\` prefix = added lines
          - \`-\` prefix = removed lines  
          - No prefix = context lines (unchanged, shown for reference)
        - **Chunk headers**: Lines like \`@@ -10,7 +10,8 @@\` show line number ranges
        
        ## Summary Guidelines:
        1. **Focus on intent and impact** rather than mechanical changes
        2. **Group related changes** across multiple files when appropriate
        3. **Use present tense** and active voice
        4. **Be specific** about what changed, not just where
        5. **Prioritize functional changes** over formatting/style changes
        6. **Include file paths** in brackets for 1-3 files, omit for larger changesets
        7. **Lead with the most significant changes**
        
        ## Summary Format:
        Use bullet points starting with \`*\`. Each point should be a complete sentence describing what was accomplished.
        
        ## Good Summary Examples:
        \`\`\`
        * Increased API response limit from 10 to 100 recordings [server/api.ts, shared/constants.ts]
        * Added error handling for network timeouts in user authentication flow
        * Refactored database connection logic to use connection pooling [db/connection.ts]
        * Fixed memory leak in WebSocket event listeners [websocket/handler.ts]
        * Updated user permissions model to support role-based access control
        \`\`\`
        
        ## What to Avoid:
        - Generic descriptions like "updated file" or "changed code"
        - Line-by-line explanations of syntax changes
        - Overly technical jargon without context
        - Listing every single file when there are many changes
        
        Now, please analyze and summarize this git diff:
        
        ${diff}
        `);
  
    return response.response.text();
};
  

export async function summariseCode(doc:Document) {
    try{
        const code = doc.pageContent.slice(0,10000)
        const response = await model.generateContent([
            `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects`,
            `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file`,
            `Here is the code:`,
            `---`,
            `${code}`,
            `---`,
            `Give a summary no more than 100 words of the code above`,
        ]);

        return response.response.text();
    }catch(error){
        return ''
    }
}

export async function generateEmbedding(summary:string) {
    const model = genai.getGenerativeModel({
        model:"text-embedding-004"
    })
    const result = await model.embedContent(summary)
    const embedding = result.embedding
    return embedding.values
}