import fs from 'fs';
import { cloudinaryUpload } from '../../config/cloudinary.config'; // কনফিগ ফাইল থেকে ইমপোর্ট

/**
 * @param filePath - লোকাল temp ফোল্ডারে থাকা ফাইলের পাথ
 * @param folderName - ক্লাউডিনারিতে যে ফোল্ডারে সেভ হবে (e.g., 'eventSphere/pdfs')
 */
export const uploadPDFToCloudinary = async (
    filePath: string, 
    folderName: string
): Promise<string | undefined> => {
    try {
        // সরাসরি কনফিগার করা cloudinaryUpload অবজেক্ট ব্যবহার করছি
        const response = await cloudinaryUpload.uploader.upload(filePath, {
            folder: folderName,
            resource_type: 'raw', // PDF এর জন্য 'raw' দেওয়া বাধ্যতামূলক
            access_mode: 'public',
        });

        // আপলোড সফল হলে লোকাল ফাইলটি ডিলিট করে দেওয়া (Cleanup)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return response.secure_url; // টিকিটের পাবলিক লিঙ্ক
    } catch (error) {
        // এরর আসলেও লোকাল ফাইল ডিলিট করা ভালো যাতে সার্ভার স্টোরেজ ফুল না হয়
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        console.error('Cloudinary Upload Error:', error);
        return undefined;
    }
};