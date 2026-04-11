import { v2 as cloudinary } from 'cloudinary';
export declare const cloudinaryUpload: typeof cloudinary;
export declare const uploadToCloudinary: (filePath: string, folderName: string) => Promise<string | undefined>;
