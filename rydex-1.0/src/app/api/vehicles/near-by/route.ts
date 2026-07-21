import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req:NextRequest) {
    try {
        await connectDb()
        // console.log("req:",req);
        const {latitude, longitude,vehicleType} = await req.json()
        // console.log(latitude, longitude,vehicleType);
        if(!latitude || !longitude){
            return NextResponse.json(
                {message:"coodinates are not found"},
                {status:400}
            
            )
        }
        const partners = await User.find({
            role:"partner",
            isOnline:true,
            partnerStatus:"approved",
            location:{
                $near:{
                    $geometry:{
                        type:"Point",
                        coordinates:[longitude,latitude]
                    },
                    $maxDistance:10000
                }
            }
        })
        const partnerIds=partners.map(p=> p._id)
        console.log("partner ids:",partnerIds.length);

        if(partnerIds.length==0){
            return NextResponse.json(
                // {message:"vehicles not found"},
                [],
                {status:200}
            )
        }

        const vehicles = await Vehicle.find({
            owner:{$in:partnerIds},
            type:vehicleType,
            status:"approved",
            isActive:"true"
        }).lean()
        console.log("vehicles route:",vehicles)
        // const vehicles = await Vehicle.find({
        //     owner:{$in:partnerIds},
        //     type:vehicleType,
        //     status:"approved",
        //     isActive:true
        // }).lean()
        
        return NextResponse.json(
                vehicles,
                {status:200}
            
            )

    } catch (error) {
        console.log(error);
        return NextResponse.json(
                {message:"near by vehicles error",error},
                {status:500}
            
            )
        
    }
    
}