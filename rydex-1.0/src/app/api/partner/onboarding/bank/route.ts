import { auth } from "@/auth";
import connectDb from "@/lib/db";
import PartnerBank from "@/models/partnerBank.model";

import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req:NextRequest){
    try {
        await connectDb;
            const session = await auth();
            if (!session || !session.user?.email) {
              return Response.json({ message: "unauthorised" }, { status: 400 });
            }
            const user = await User.findOne({ email: session.user.email });
            if (!user) {
              return Response.json({ message: "user not found" }, { status: 400 });
            }

            const {accountHolder,mobileNumber,accountNumber,upi,ifsc} = await req.json()
            if(!accountHolder || !mobileNumber || !accountNumber || !ifsc){
                return Response.json({ message: "send all bank details" }, { status: 400 });
            }
            const partnerBank = await PartnerBank.findOneAndUpdate(
                {owner:user._id},
                {
                    accountHolder,
                    accountNumber,
                    ifsc,
                    upi,
                    status:"added"
                },
                {upsert:true, new:true}
            )
            user.mobileNumber = mobileNumber;
            user.patnerOnBoardingStep = 3
            
            user.partnerStatus="pending"
            await user.save()
            return Response.json(partnerBank, { status: 201 });

    } catch (error) {
        return Response.json({ message: `partner bank error ${error}` }, { status: 500 });
    }
}

export async function GET(req:NextRequest){
    try {
        await connectDb;
            const session = await auth();
            if (!session || !session.user?.email) {
              return Response.json({ message: "unauthorised" }, { status: 400 });
            }
            const user = await User.findOne({ email: session.user.email });
            if (!user) {
              return Response.json({ message: "user not found" }, { status: 400 });
            }
            const partnerBank = await PartnerBank.findOne({owner:user._id})
            if(partnerBank){
                return Response.json(
                    {partnerBank,mobileNumber:user.mobileNumber}, 
                    { status: 200 });
            }else{
                return Response.json(
                    {message:"bank details not found"}, 
                    { status: 200 });
            }

    } catch (error) {
        return Response.json({ message: `get partner bank error ${error}` }, { status: 500 });
    }
}