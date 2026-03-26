import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import env from '../config/env'; // আপনার env ফাইলের পাথ অনুযায়ী আপডেট করুন

// ১. ক্লাউডিনারি কনফিগারেশন
cloudinary.config({
    cloud_name: env.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY.CLOUDINARY_API_SECRET,
});

/**
 * @param filePath - লোকাল temp ফোল্ডারে থাকা ফাইলের পাথ
 * @param folderName - ক্লাউডিনারিতে যে ফোল্ডারে সেভ হবে (e.g., 'event_tickets')
 */
export const uploadPDFToCloudinary = async (
    filePath: string, 
    folderName: string
): Promise<string | undefined> => {
    try {
        const response = await cloudinary.uploader.upload(filePath, {
            folder: folderName,
            resource_type: 'raw', // PDF এর জন্য 'raw' দেওয়া জরুরি
            access_mode: 'public',
        });

        // ২. আপলোড সফল হলে লোকাল ফাইলটি ডিলিট করে দেওয়া (Cleanup)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return response.secure_url; // টিকিটের পাবলিক লিঙ্ক
    } catch (error) {
        // এরর আসলেও লোকাল ফাইল ডিলিট করা ভালো যাতে স্টোরেজ ফুল না হয়
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error('Cloudinary Upload Error:', error);
        return undefined;
    }
};

export const cloudinaryUpload = cloudinary;