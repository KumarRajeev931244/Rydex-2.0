import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
        
        await connectDb()
        const session = await auth()
                        if(!session || !session?.user?.email){
                            return NextResponse.json(
                                {message:"unauthorised"},
                                {status: 400}
                            )
                        }

        const user = await User.findOne({email:session.user.email})
        const booking = await Booking.findOne({
            driver:user._id,
            bookingStatus:{$in:["confirmed", "started"]}
        }).populate("user vehicle driver")
        console.log("Booking:",booking);
       
        return NextResponse.json(
                booking,
                {status:200}
            )
        
    } catch (error) {
        return NextResponse.json(
                {message:"get active ride for partner error"},
                {status:500}
            )
        
    }
}