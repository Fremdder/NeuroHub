'use client'

import { CircularProgressbar , buildStyles } from 'react-circular-progressbar'
import { Card } from "@/components/ui/card"
import { useDropzone } from 'react-dropzone'
import React from "react"
import { uploadFile } from "@/lib/cloudinary"
import { Presentation, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from '@/trpc/react'
import useProject from '@/hooks/use-project'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const MeetingCard = () => {
    const {project} = useProject()
    const [isUploading,setIsUploading] = React.useState(false)
    const [progress,setProegress] = React.useState(0)
    const router = useRouter()
    const uploadMeeting = api.project.uploadMeeting.useMutation()
    const { getRootProps,getInputProps } = useDropzone({
        accept : {
            'audio/*':['mp3','.wav','.m4a']
        },
        multiple:false,
        maxSize: 50_000_000,
        onDrop: async acceptedFiles => {
            if(!project) return
            setIsUploading(true)
            const file = acceptedFiles[0]
            if(!file) return
            const downloadURL = await uploadFile(file as File , setProegress) as string
            uploadMeeting.mutate({
                projectId:project.id,
                meetingUrl : downloadURL,
                name : file.name
            },
            {
                onSuccess: () => {
                    toast.success("Meeting Uploaded Successfully")
                    router.push('/meetings')
                },
                onError: () => {
                    toast.error("Failed to Upload")
                }
            }
        )
            setIsUploading(false)
        }
    }
    )
    return(
        <Card
        className="col-span-2 flex flex-col items-center justify-center text-center h-60 px-4 py-6 gap-2"
        {...getRootProps()}
        >
        {!isUploading && (
            <>
            <Presentation className="h-10 w-10 animate-bounce"  />
            <h3 className="text-sm font-semibold text-gray-900">
                Create a new meeting
            </h3>
            <p className="text-xs text-gray-500">
                Analyse your meeting with NeuroHub <br /> Powered by AI
            </p>
            <Button disabled={isUploading} className="mt-3">
                <Upload className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                Upload Meeting
                <input className="hidden" {...getInputProps()} />
            </Button>
            </>
        )}
        {isUploading &&(
            <div>
                <CircularProgressbar value={progress} text={`${progress}%`} className='size-20' styles={
                    buildStyles({
                        pathColor:'#8E24AA',
                        textColor:'#8E24AA',
                    })
                }/>
                <p className='text-sm text-gray-500 text-center'>
                    Uploading your meeting...
                </p>
            </div>
        )}
        </Card>

    )
}

export default MeetingCard