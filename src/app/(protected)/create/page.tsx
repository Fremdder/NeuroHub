'use client'
import React from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refresh";

type FormInput = {
  repoUrl: string,
  ProjectName: string,
  githubToken?: string
}

const CreatePage = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInput>()
  const createProject = api.project.createProject.useMutation()
  const refetch = useRefetch()


  function onSubmit(data: FormInput) {
    createProject.mutate({
      githubUrl : data.repoUrl,
      name : data.ProjectName,
      githubToken :data.githubToken
    },
    {
      onSuccess:()=>{
        toast.success('Project created successfully')
        refetch()
        reset()
      },
      onError:()=>{
        toast.error('Failed to create project')
      }
    }
  )
    return true;
  }

  return (
    <div className="absolute inset-0 m-auto flex justify-center items-center gap-12 max-w-fit max-h-fit">
      <img src='/img.jpeg' className="h-56 w-auto" alt="NeuroHub" />
      <div>
        <div>
          <h1 className="font-semibold text-2xl">
            Link your Github Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your repository to link it to NeuroHub
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
              {...register('ProjectName', { required: 'Project name is required' })}
              placeholder='Project Name'
            />
            {errors.ProjectName && (
              <p className="text-red-500 text-sm mt-1">{errors.ProjectName.message}</p>
            )}
            
            <div className="h-2"></div>
            
            <Input
              {...register('repoUrl', { 
                required: 'Repository URL is required',
                pattern: {
                  value: /^https:\/\/github\.com\/.+\/.+/,
                  message: 'Please enter a valid GitHub URL'
                }
              })}
              placeholder='Github URL'
              type='url'
            />
            {errors.repoUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.repoUrl.message}</p>
            )}
            
            <div className="h-2"></div>
            
            <Input
              {...register('githubToken')}
              placeholder='Github Token (Optional)'
              type="text"
            />
            
            <div className="h-4"></div>
            
            <Button type='submit' disabled={createProject.isPending}>
              Create Project
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePage;