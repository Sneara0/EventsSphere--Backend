import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: async (req, file) => {
        const originalName = file.originalname;
        const extension = originalName.split(".").pop()?.toLowerCase();
        // ১. ফাইলের নাম ক্লিন করা (Regex ব্যবহার করে স্পেস ও স্পেশাল ক্যারেক্টার সরানো)
        const fileNameWithoutExtension = originalName
            .split(".")
            .slice(0, -1)
            .join(".")
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, "");
        // ২. ইউনিক আইডি ও টাইমস্ট্যাম্প যুক্ত করা
        const uniqueId = Math.random().toString(36).substring(2, 7);
        const uniqueName = `${uniqueId}-${Date.now()}-${fileNameWithoutExtension}`;
        // ৩. ডাইনামিক ফোল্ডার পাথ
        const folderPath = extension === "pdf" ? "pdfs" : "images";
        return {
            folder: `eventSphere/${folderPath}`,
            public_id: uniqueName,
            resource_type: "auto", // PDF এবং Image উভয়ই হ্যান্ডেল করবে
        };
    },
});
export const multerUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // ৫ এমবি লিমিট
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp",
            "application/pdf"
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Only .jpg, .png, .jpeg, .webp and .pdf formats are allowed!"), false);
        }
    }
});
