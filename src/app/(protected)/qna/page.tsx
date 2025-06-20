'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import useProject from "@/hooks/use-project"
import { api } from "@/trpc/react"
import React from "react"
import AskQuestionCard from "../dashboard/ask-question-card"
import MDEditor from "@uiw/react-md-editor"
import CodeReferences from "../dashboard/code-references"

const QnaPage = () => {
  const { projectId } = useProject()
  const { data: questions } = api.project.getQuestions.useQuery({ projectId })

  const [questionIndex, setQuestionIndex] = React.useState(0)
  const question = questions?.[questionIndex]

  return (
    <div className="space-y-6">
      <Sheet>
        <AskQuestionCard />
        <div>
          <h1 className="text-xl font-semibold">Saved Questions</h1>
        </div>

        <div className="flex flex-col gap-3">
          {questions?.map((q, index) => (
            <React.Fragment key={q.id}>
              <SheetTrigger onClick={() => setQuestionIndex(index)}>
                <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow border hover:bg-gray-50 transition cursor-pointer">
                  <img
                    className="rounded-full w-8 h-8 object-cover flex-shrink-0"
                    src={q.user.imageUrl ?? '/default-avatar.png'}
                    alt="User Avatar"
                  />
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-800 text-base font-medium line-clamp-1">
                        {q.question}
                      </p>
                      <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                      {q.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>

            </React.Fragment>
          ))}
        </div>

        {question && (
          <SheetContent className="sm:max-w-[80vw]">
            <SheetHeader className="space-y-4">
              <SheetTitle className="text-lg font-bold">{question.question}</SheetTitle>
              <MDEditor.Markdown source={question.answer} />
              <CodeReferences filesReferences={(question.filesReferences ?? []) as any} />
            </SheetHeader>
          </SheetContent>
        )}
      </Sheet>
    </div>
  )
}

export default QnaPage
