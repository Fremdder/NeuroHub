'use client'
import MdEditor from '@uiw/react-md-editor'
import React from "react"
import useProject from '@/hooks/use-project'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Brain } from "lucide-react"
import { askQuestion } from "./action"
import { readStreamableValue } from "ai/rsc"
import CodeReferences from './code-references'
import { api } from '@/trpc/react'
import { toast } from 'sonner'

const AskQuestionCard = () => {
  const { project } = useProject()
  const [open, setOpen] = React.useState(false)
  const [question, setQuestion] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [response, setResponse] = React.useState('')
  const [answer,setAnswer]  = React.useState('')
  const [filesReferences, setFilesReferences] = React.useState<{ fileName: string; sourceCode: string; summary: string }[]>([])
  const saveAnswer = api.project.saveAnswer.useMutation()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer('')
    setFilesReferences([])
    e.preventDefault()
    if (!project?.id) return;

    setLoading(true)
    const { output, fileReferences } = await askQuestion(question, project.id)
    setOpen(true)
    setFilesReferences(fileReferences)

    for await (const delta of readStreamableValue(output)) {
      if(delta){
        console.log("hmmm")
            setAnswer(prev => prev + (delta as string))
      }
    }

    setLoading(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader>
            <div className='flex item-center gap-2'>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6" /> NeuroHub Answer
              </DialogTitle>
              <Button disabled={saveAnswer.isPending} variant={'outline'} onClick={()=>{
                saveAnswer.mutate({
                  projectId : project!.id,
                  question,
                  answer,
                  filesReferences
                }),{
                  onSuccrss:() => {
                    toast.success('Answer saved!')
                  },
                  onError : () => {
                    toast.error('Failed to save answer!')
                  }
                }
              }}>
                Save Answer
              </Button>
            </div>
          </DialogHeader>

          <MdEditor.Markdown
            source={answer}
            className="max-w-[70vw] !h-full max-h-[35vh] overflow-scroll bg-white text-black p-4 rounded"
          />
          <div className="h-4"></div>
          <CodeReferences filesReferences={filesReferences}/>

          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>


      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
            <div className="h-4" />
            <Button type="submit" disabled={loading}>
              {loading ? 'Thinking...' : 'Ask NeuroHub'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default AskQuestionCard
