import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "unauthorised" }, { status: 400 });
    }

    const partner = await User.findOne({ email: session.user.email });
    if (!partner) {
      return Response.json({ message: "partner not found" }, { status: 400 });
    }

    // const  {baseFare,pricePerKm,waitingCharge} = await req.json()

    const vehicle = await Vehicle.findOne({owner:partner._id})
    if (!vehicle) {
      return Response.json({ message: "vehicle not found" }, { status: 400 });
    }

    const formData = await req.formData();
    const image = formData.get("image") as File | null
    const baseFare = formData.get("baseFare")
    const pricePerKm = formData.get("pricePerKm")
    const waitingCharge = formData.get("waitingCharge")

    let updated=false
    if(image && image.size>0){
        const imageUrl = await uploadOnCloudinary(image)
        vehicle.imageUrl = imageUrl
        updated = true
    }
    if(baseFare!==null){
        
        vehicle.baseFare = Number(baseFare)
        updated = true
    }

    if(waitingCharge!==null){
        
        vehicle.waitingCharge = Number(waitingCharge)
        updated = true
    }

     if(pricePerKm!==null){
        
        vehicle.pricePerKm = Number(pricePerKm)
        updated = true
    }
    if(updated==false){
         return Response.json({ message: "Nothing to update" }, { status: 400 });
    }
    vehicle.status = "pending"
    vehicle.rejectionReason = undefined
    await vehicle.save()
    partner.patnerOnBoardingStep = 6
    await partner.save()
     return Response.json({ message: "pricing submitted" }, { status: 200 });


  } catch (error) {
    console.log("prcing error:",error);

     return Response.json({ message: "pricing model error" }, { status: 500 });
  }
}

export async function GET(){
    try {
         await connectDb();
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "unauthorised" }, { status: 400 });
    }

    const partner = await User.findOne({ email: session.user.email });
    if (!partner) {
      return Response.json({ message: "partner not found" }, { status: 400 });
    }

    // const  {baseFare,pricePerKm,waitingCharge} = await req.json()

    const vehicle = await Vehicle.findOne({owner:partner._id})
    if (!vehicle) {
      return Response.json({ message: "vehicle not found" }, { status: 400 });
    }
    return Response.json(vehicle, { status: 200 });

    } catch (error) {
        return Response.json({ message: "pricing getting error" }, { status: 500 });
        
    }
}