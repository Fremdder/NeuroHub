'use client'

import { SignUp } from '@clerk/nextjs'
import { Brain } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Brain className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-purple-600">NeuroHub</h1>
        </div>
        <p className="text-center text-gray-500 mb-4">Create your account</p>
        <SignUp
          path="/sign-up"
          routing="path"
          appearance={{
            variables: {
              colorPrimary: '#7C3AED',
            },
            elements: {
              formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
              card: 'shadow-none border border-gray-200 rounded-lg',
              headerTitle: 'text-xl font-semibold text-gray-800',
              headerSubtitle: 'text-sm text-gray-500',
            },
          }}
        />
      </div>
    </div>
  )
}
