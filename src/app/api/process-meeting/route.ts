import { processMeeting } from "@/lib/assembly";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../../../server/db";

const bodyParser = z.object({
    meetingUrl : z.string(),
    projectId : z.string(),
    meetingId : z.string()
})

export const maxDuration = 50

export async function POST(req: NextRequest){
    const { userId } = await auth()
    if(!userId){
        return NextResponse.json({error: "Unauthorized"},{status:401})
    }
    try{
        const body = await req.json()
        const { meetingUrl,projectId,meetingId } = bodyParser.parse(body)
        const {summaries} = await processMeeting(meetingUrl)
        await db.issue.createMany({
            data : summaries.map(summary => (
                {
                    start:summary.start,
                    end:summary.end,
                    gist:summary.gist,
                    headline:summary.end,
                    summary:summary.summary,
                    meetingId
                }))
        })
        await db.meeting.update({
            where : {id:meetingId},data :{
                status : "COMPELETED",
                name : summaries[0]!.headline

            }
        })
        return NextResponse.json({success:true},{status:200})
    }catch(error){
        return NextResponse.json({error:"Interna; Server Error"},{status:500})
    }
}