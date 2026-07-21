import connectDb from "@/lib/db";
import ChatMessage from "@/models/chatMessage.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const geminiUrl=process.env.GEMINI_API_URL!
export async function POST(req:NextRequest) {
    try {
        await connectDb();
        const {role,lastMessage} = await req.json()
        const prompt = `you are AI reply suggesstion system for a vehicle booking chat app.
        Generate short,smart, human-like quick reply suggesstion based on:
        -ROLE(DRIVER OR USER)
        -RECENT_MESSAGE
        
        Rules:
        -return extactly 6 suggesstions
        -keep replies short (3-12 words)
        -match the converstation context and tone
        -driver replies should sound professional and helpful
        -user repiles should sound natural and realistic
        -avoid repetation
        -return only valid json
        
        output format:{
        "suggestions":[
        "reply 1",
        "reply 2",
        "reply 3",
        "reply 4",
        "reply 5",
        "reply 6",
        ]
        }
        Input:
        ROLE:${role}
        RECENT_MESSAGE: ${lastMessage}
        
        `


        const response = await axios.post(
  geminiUrl,
  {
    model: "gemini-3.5-flash",
    input: `${prompt}`
  },
  {
    headers: {
      'Content-Type': 'application/json'
    }
  }
);
const modelOutput = response.data.steps.find((step: any) => step.type === 'model_output');
const suggesstion = modelOutput?.content?.[0]?.text;

console.log("suggesstion:",suggesstion);

 return NextResponse.json(
            suggesstion,
            {status:200}
        )
// console.log("gemini response:",data);
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {message:"get Ai suggesstion message error:",error},
            {status:500}
        )
        
    }
    
}