import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";
import { Prisma } from "@prisma/client";

export const projectRouter = createTRPCRouter({

    createProject : protectedProcedure.input(
        z.object({
            name : z.string(),
            githubUrl: z.string(),
            githubToken : z.string().optional()
        })
    ).mutation(async ({ctx,input}) => {
        try{
            const project = await ctx.db.project.create({
                data:{
                    githubUrl : input.githubUrl,
                    name : input.name,
                    userToProject : {
                        create:{
                            userId : ctx.user.userId!,
                        }
                    }
                }
            })
            await indexGithubRepo(project.id,input.githubUrl,input.githubToken)
            await pollCommits(project.id)
            return project
        }catch(error){
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
              ) {
                throw new Error("A project with this name and GitHub URL already exists.");
              }
        
              throw error;
        }
    }),
    getProjects : protectedProcedure.query(async ({ctx}) => {
        return await ctx.db.project.findMany({
            where:{
                userToProject:{
                    some:{
                        userId:ctx.user.userId!
                    }
                },
                deletedAt : null
            }
        })
    }),
    getCommits: protectedProcedure.input(
        z.object({
          projectId: z.string()
        })
      ).query(async ({ ctx, input }) => {
        pollCommits(input.projectId).then().catch(console.log)
        return await ctx.db.commit.findMany({
          where: {
            projectId: input.projectId
          }
        });
      }),
    saveAnswer:protectedProcedure.input(z.object({
        projectId:z.string(),
        question:z.string(),
        answer:z.string(),
        filesReferences:z.any()
      })).mutation(async ({ctx,input}) => {
        return await ctx.db.question.create({
            data: {
                answer:input.answer,
                filesReferences:input.filesReferences,
                projectId:input.projectId,
                question:input.question,
                userId:ctx.user.userId!
            }
        })
      }),
      getQuestions : protectedProcedure.input(z.object({
        projectId:z.string()
      })
      ).query(async ({ctx,input}) => {
        return await ctx.db.question.findMany({
            where: {
                projectId:input.projectId
            },
            include: {
                user:true
            },
            orderBy:{
                createdAt:'desc'
            }
        })
      })
       
})