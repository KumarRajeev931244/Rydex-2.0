import connectDb from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        await connectDb();
        const {bookingId, dropOtp} = await req.json()
        const booking = await Booking.findById(bookingId).populate("user")
        if(!booking){
            return NextResponse.json(
                {message:"booking not found"},
                {status:400}
            )

        }
        console.log("drop otp:",booking?.dropOtp);
        console.log("otp:",dropOtp);
         if(booking?.dropOtp!=dropOtp){
            return NextResponse.json(
                {message:"incorrect drop otp"},
                {status:400}
            )
         }

         if(booking?.dropOtpExpires< new Date()){
            return NextResponse.json(
                {message:"otp expire"},
                {status:400}
            )
         }

         if(booking.paymentStatus === "cash"){
            const adminCommission = booking.fare*0.10
        const partnerAmount = booking.fare-adminCommission
        booking.adminCommission= adminCommission
        booking.partnerAmount = partnerAmount
         }
         booking.paymentStatus="paid"
         booking.bookingStatus="completed"
         booking.dropOtp=""
         booking.dropOtpExpires = undefined
         await booking.save()
        
          return NextResponse.json(
                {message:"drop otp verified"},
                {status:200}
            )

    } catch (error) {
         return NextResponse.json(
                {message:"drop otp verified error",error},
                {status:500}
            )
        
    }
    
}