'use client'

import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle ,Dialog, DialogContent} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import useProject from "@/hooks/use-project"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"

const InviteButton = () => {
    const { projectId } = useProject()
    const [open, setOpen] = useState(false)
    const [inviteLink, setInviteLink] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined' && projectId) {
            setInviteLink(`${window.location.origin}/join/${projectId}`)
        }
    }, [projectId])

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Team Members</DialogTitle>
                    </DialogHeader>
                    <p className='text-sm text-gray-500'>
                        Ask them to copy and paste this link
                    </p>
                    <Input
                        className='mt-4'
                        readOnly
                        onClick={() => {
                            navigator.clipboard.writeText(inviteLink)
                            toast.success("copied to clipboard")
                        }}
                        value={inviteLink}
                    />
                </DialogContent>
            </Dialog>
            <Button size='sm' onClick={() => setOpen(true)}>Invite Members</Button>
        </>
    )
}

export default InviteButton
