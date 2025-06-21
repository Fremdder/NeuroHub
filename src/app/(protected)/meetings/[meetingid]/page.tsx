import React from "react"
import IssueList from "./issue-list"

type Props = {
    params : Promise<{meetingid : string}>
}

const MeetingDetailsPage = async ({params}:Props) => {
    const {meetingid} = await params  
    return(
        <IssueList meetingId={meetingid} />
    )
}

export default MeetingDetailsPage