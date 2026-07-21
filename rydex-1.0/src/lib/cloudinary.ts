import {v2 as cloudinary} from 'cloudinary'

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true
});

const uploadOnCloudinary = async (file:Blob):Promise<string | null> => {
    if(!file){
        return null 
    }
    try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        return new Promise((resolve,reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "auto",
                    // folder: "rydex/partner-docs"
                },
                (error,result) => {
                    if(error){
                        console.error("Cloudinary upload error:", {
                            message: error.message,
                            status: error.status,
                            http_code: error.http_code,
                            response: error.response
                        });
                        reject(error)
                    }else{
                        resolve(result?.secure_url ?? null)
                    }
                }
            )
            uploadStream.end(buffer)
        })
    } catch (error) {
        console.log("Cloudinary error caught:", error);
        return null
    }
}

export default uploadOnCloudinary