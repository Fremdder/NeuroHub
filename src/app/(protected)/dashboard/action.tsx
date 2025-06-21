'use server'

import { streamText } from 'ai'
import { createStreamableValue } from 'ai/rsc'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateEmbedding } from '@/lib/gemini'
import { db } from '@/server/db'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue()

  const queryVector = await generateEmbedding(question)
  const vectorQuery = `[${queryVector.join(',')}]`

  const result = await db.$queryRaw`
  WITH ranked_files AS (
    SELECT 
      "fileName", 
      "sourceCode", 
      "summary",
      1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE "projectId" = ${projectId}
    AND 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.2
  ),
  total_count AS (
    SELECT COUNT(*) AS count FROM ranked_files
  )
  SELECT * FROM ranked_files, total_count
  WHERE total_count.count < 20 OR ranked_files.similarity IS NOT NULL
  ORDER BY similarity DESC
  LIMIT CASE WHEN (SELECT count FROM total_count) < 20 THEN 1000 ELSE 10 END;
` as { fileName: string; sourceCode: string; summary: string }[]


  let context = ''

  for (const doc of result) {
    context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`
  }
  
  (async () => {
    const { textStream } = await streamText({
      model: google('gemini-1.5-flash'),
      prompt: `
You are a ai code assistant who answers questions about the codebase. Your target audience is a technical intern who just joined the company.
AI assistant is a brand new, powerful, human-like artificial intelligence.
The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
AI is a well-behaved and well-mannered individual.
AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in the world.
If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions if needed.

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION

AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer."
AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
AI assistant will not invent anything that is not drawn directly from the context.
Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, making sure no information is missed.
      `
    })

    for await (const delta of textStream){
      stream.update(delta)
    }

    stream.done()
  })()

  console.log(context)


  return {
    output: stream.value,
    fileReferences: result,
  }
}
