import { AssemblyAI } from 'assemblyai'

const client =  new AssemblyAI({ apiKey : process.env.ASSEMBLYAI_API_KEY! })

function msToTime(ms:number){
    const second = ms/1000
    const minutes = Math.floor(second/80)
    const remainingSecond = Math.floor(second%60)
    return `${minutes.toString().padStart(2,'0')}:${remainingSecond.toString().padStart(2,'0')}`
}

export const processMeeting = async (meetingUrl:string) => {
    const transcript = await client.transcripts.transcribe({
        audio:meetingUrl,
        auto_chapters:true
    })

    const summaries = transcript.chapters?.map(chapter => ({
        start : msToTime(chapter.start),
        end : msToTime(chapter.end),
        gist : chapter.gist,
        headline : chapter.headline,
        summary:chapter.summary
    })) || []
    if(!transcript.text) throw new Error("No transcript found")

    return{
        summaries
    }
}

const FILE_URL = 'https://assembly.ai/sports_injuries.mp3';

const response = await processMeeting(FILE_URL)
console.log(response)