import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
// ১. কনফিগারেশন চেক (অবশ্যই .env ফাইল থেকে আসবে)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});
export const cloudinaryUpload = cloudinary;
export const uploadToCloudinary = async (filePath, folderName) => {
    try {
        // ফাইলটি আছে কি না চেক করা
        if (!fs.existsSync(filePath)) {
            console.error('❌ File path does not exist:', filePath);
            return undefined;
        }
        // ২. ক্লাউডিনারিতে আপলোড (Signed Upload হিসেবে কাজ করবে কারণ কনফিগ দেওয়া আছে)
        const response = await cloudinary.uploader.upload(filePath, {
            folder: `eventSphere/${folderName}`,
            resource_type: 'auto',
            // যদি Unsigned error আসে, তবে নিচের লাইনটি ব্যবহার করে দেখতে পারেন:
            // use_filename: true,
            // unique_filename: true,
        });
        // ৩. আপলোড সফল হলে লোকাল ফাইল ডিলিট করা
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return response.secure_url;
    }
    catch (error) {
        // ৪. এরর আসলেও লোকাল ফাইল ডিলিট করা (যাতে স্টোরেজ জ্যাম না হয়)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error('🔥 Cloudinary Detail Error:', error); // পুরো এরর অবজেক্টটি লগ করা ভালো
        return undefined;
    }
};
