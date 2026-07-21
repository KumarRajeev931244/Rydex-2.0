import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import PartnerDocs from "@/models/partnerDocx.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
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

    const formdata = await req.formData();
    const aadhar = formdata.get("aadhar") as Blob | null;
    const license = formdata.get("license") as Blob | null;
    const rc = formdata.get("rc") as Blob | null;
    if (!aadhar || !license || !rc) {
      return Response.json(
        { message: "all document are required" },
        { status: 400 },
      );
    }
    const updatePayload: any = {
      status: "pending"
    };
    if (aadhar) {
      const url = await uploadOnCloudinary(aadhar);
      if (!url) {
        return Response.json(
          { message: "aadhar upload failed" },
          { status: 500 },
        );
      }
      updatePayload.aadharUrl = url;
    }
    if (license) {
      const url = await uploadOnCloudinary(license);
      if (!url) {
        return Response.json(
          { message: "license upload fail" },
          { status: 500 },
        );
      }
      updatePayload.licenseUrl = url;
    }
    if (rc) {
      const url = await uploadOnCloudinary(rc);
      if (!url) {
        return Response.json({ message: "rc upload fail" }, { status: 500 });
      }
      updatePayload.rcUrl = url;
    }
    const partnerDoc = await PartnerDocs.findOneAndUpdate(
      { owner: user._id },
      { $set: updatePayload },
      { upsert: true, new: true },
    );
    if (user.patnerOnBoardingStep < 2) {
      user.patnerOnBoardingStep = 2;
    }else{
      user.patnerOnBoardingStep = 3;
    }
    user.partnerStatus = "pending"
    await user.save();
    return Response.json(partnerDoc , { status: 201 });
  } catch (error) {
    console.error("=== PARTNER DOCUMENT UPLOAD ERROR ===");
    console.error("Error object:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    console.error("Full error:", JSON.stringify(error, null, 2));
    console.error("=====================================");
    return Response.json(
      { message: `partner docs error ${error}` },
      { status: 500 },
    );
  }
}
