import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;

// export async function POST(req: Request) {
//   try {
//     await connectDb();
//     const session = await auth();
//     if (!session || !session.user?.email) {
//       return Response.json({ message: "unauthorised" }, { status: 400 });
//     }
//     const user = await User.findOne({ email: session.user.email });
//     if (!user) {
//       return Response.json({ message: "user not found" }, { status: 400 });
//     }
//     const { type, number, vehicleModel } = await req.json();
//     if (!type || !number || !vehicleModel) {
//       return Response.json(
//         { message: "missing required details" },
//         { status: 400 },
//       );
//     }
//     if (!VEHICLE_REGEX.test(number)) {
//       return Response.json(
//         { message: "invalid Vehicle Number Fomat" },
//         { status: 400 },
//       );
//     }
//     const vehicleNumber = number.toUpperCase();
    

//     let vehicle = await Vehicle.findOne({ owner: user._id });
//     console.log(vehicle);
//     if (vehicle) {
//       vehicle.type = type;
//       vehicle.number = vehicleNumber;
//       //  vehicle.vehicleModel = vehicleModel; // fixed typo
//       vehicle.vehicelModel = vehicleModel;
//       vehicle.status = "pending";
//       await vehicle.save();
//       if(user.patnerOnBoardingStep<2){
//         user.patnerOnBoardingStep = 2
//         user.partnerStatus = "pending"
//         await user.save()
//       }else{
//         user.patnerOnBoardingStep = 3
//         user.partnerStatus = "pending"
//         await user.save()
//       }
//       // check here
//     } else {
//       const duplicate = await Vehicle.findOne({ vehicleNumber });
//     if (duplicate) {
//       return Response.json(
//         { message: "Vehicle alredy registered" },
//         { status: 400 },
//       );
//     }
//       vehicle = await Vehicle.create({
//         owner:user._id,
//         type,
//         number: vehicleNumber,
//        vehicleModel,
//       });
//     }

//     if (user.patnerOnBoardingStep < 1) {
//       user.patnerOnBoardingStep = 1;
//     }
//     user.role = "partner";
//     user.partnerStatus = "pending"
//     await user.save();
//     return Response.json({ vehicle }, { status: 200 });
//   } catch (error) {
//     return Response.json(
//       { message: `vehicle error ${error}` },
//       { status: 500 },
//     );
//   }
// }



export async function POST(req: Request) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "unauthorised" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ message: "user not found" }, { status: 400 });
    }

    const { type, number, vehicleModel } = await req.json();
    if (!type || !number || !vehicleModel) {
      return Response.json(
        { message: "missing required details" },
        { status: 400 },
      );
    }

    if (!VEHICLE_REGEX.test(number)) {
      return Response.json(
        { message: "invalid Vehicle Number Format" },
        { status: 400 },
      );
    }

    const vehicleNumber = number.toUpperCase();

    let vehicle = await Vehicle.findOne({ owner: user._id });

    if (vehicle) {
      // Update existing vehicle
      vehicle.type = type;
      vehicle.number = vehicleNumber;
      vehicle.vehicleModel = vehicleModel; // fixed typo
      vehicle.status = "pending";
      await vehicle.save();

      // Increment step by +1 only (no skipping)
      if (user.patnerOnBoardingStep < 3) {
        user.patnerOnBoardingStep += 1;
      }

      user.partnerStatus = "pending";
      await user.save();
    } else {
      // Create new vehicle
      const duplicate = await Vehicle.findOne({ number: vehicleNumber }); // fixed field name
      if (duplicate) {
        return Response.json(
          { message: "Vehicle already registered" },
          { status: 400 },
        );
      }

      vehicle = await Vehicle.create({
        owner: user._id,
        type,
        number: vehicleNumber,
        vehicleModel,
      });

      if (user.patnerOnBoardingStep < 1) {
        user.patnerOnBoardingStep = 1;
      }

      user.role = "partner";
      user.partnerStatus = "pending";
      await user.save();
    }

    return Response.json({ vehicle }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: `vehicle error ${error}` },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ message: "unauthorised" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ message: "user not found" }, { status: 400 });
    }

    let vehicle = await Vehicle.findOne({ owner: user._id }); // fixed to use _id
    if (vehicle) {
      return Response.json(vehicle, { status: 200 });
    } else {
      return Response.json({ message: "vehicle not found" }, { status: 400 });
    }
  } catch (error) {
    return Response.json(
      { message: `get vehicle error ${error}` },
      { status: 500 },
    );
  }
}



// export async function GET(req:NextRequest){
//     try {
//         await connectDb();
//     const session = await auth();
//     if (!session || !session.user?.email) {
//       return Response.json({ message: "unauthorised" }, { status: 400 });
//     }
//     const user = await User.findOne({ email: session.user.email });
//     if (!user) {
//       return Response.json({ message: "user not found" }, { status: 400 });
//     }
//     let vehicle = await Vehicle.findOne({ owner: user._id });
//     if(vehicle){
//         return Response.json(vehicle, {status:200})
//     }else{
//         return Response.json({message:"vehicle not found"}, {status:400})
//     }
        

//     } catch (error) {
//         return Response.json(
//       { message: `get vehicle error ${error}` },
//       { status: 500 },
//     );
//     }
// }