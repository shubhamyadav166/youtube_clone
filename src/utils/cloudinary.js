import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

// env variable checklist 
console.log("Cloudinary ENV:", {
    cloud: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_API_SECRET ? "loaded" : undefined,
});
// env variable checklist

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {


    try {
        console.log(`${localFilePath}`);

        console.log("coloudinary method running");
        if (!localFilePath) return null;
        console.log("Local file path .........coloudinary method running");
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto' })
        // file has been uploaded successfully
        console.log("after uploading on cloudinary", response);

        console.log("file uploaded on cloudinary", response.url);


        return response;

    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath) // remove the localy saved file path for on the failed on upload method
            // remove the localy saved file path for on the failed on upload method
            console.log("somthing error in cloudinary funtion ", error)

        }
        return null


    }
}
export default uploadOnCloudinary 
