import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try {
        await connectDb();
        const session = await auth()
        console.log(session);
        if(!session || !session.user?.email || session.user?.role !=="admin"){
            return Response.json(
                    {message:"unauthorised"}, 
                    { status: 400 });
        }
        const totalPartners = await User.countDocuments({role:"partner"})
        const totalApprovedPartners = await User.countDocuments({role:"partner", partnerStatus:"approved"})
        const totalPendingPartners = await User.countDocuments({role:"partner", partnerStatus:"pending"})
        const totalRejectedPartners = await User.countDocuments({role:"partner", partnerStatus:"rejected"})
        const pendingPartnerUsers = await User.find({
            role:"partner",
            partnerStatus:"pending",
            patnerOnBoardingStep:{$gte:3}
        })
        const partnerIds = pendingPartnerUsers.map((p) => p._id)
        const partnerVehicless = await Vehicle.find({
            owner:{$in:partnerIds}
        })

        const vehicleTypeMap = new Map(
            partnerVehicless.map((v) => [String(v.owner),v.type])
        )

        const pendingPartnerReviews = pendingPartnerUsers.map((p) => ({
            _id:p._id,
            name:p.name,
            email:p.email,
            vehicleType:vehicleTypeMap.get(String(p._id))
        }))

        const pendingVehicles = await Vehicle.find({
            status:"pending",
            baseFare:{$exists:true}
        }).populate("owner")
        
        return NextResponse.json({
            pendingVehicles,
            stats:{

                totalApprovedPartners,
                totalPartners,
                totalPendingPartners,
                totalRejectedPartners
            },pendingPartnerReviews
        },
            {status:200})
    

    } catch (error) {
        console.log("admin dashborar error:",error);
        return NextResponse.json(
            {message: `admin dashboard error ${error}`},
            {status:500}
        )
        
    }
}