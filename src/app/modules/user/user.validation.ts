import { z } from "zod";

/**
 * ১. প্রোফাইল আপডেট করার জন্য বুলেটপ্রুফ ভ্যালিডেশন স্কিমা
 */
const updateMyProfile = z.object({
    body: z.object({
        // z.string() এর ভেতরে অবজেক্ট না দিয়ে সরাসরি মেথড চেইন ব্যবহার করুন
        name: z.string()
            .describe("User's full name") // description এর বদলে .describe() ব্যবহার করুন
            .optional(),
        
        image: z.string()
            .url("Image must be a valid URL")
            .optional(),
        
        contactNumber: z.string()
            .min(10, "Contact number must be at least 10 characters")
            .max(15, "Contact number cannot exceed 15 characters")
            .optional(),
        
        address: z.string().optional(),
        
        bio: z.string()
            .max(500, "Bio cannot exceed 500 characters")
            .optional(),
        
        organizationName: z.string().optional(),
    }).strict(), 
});

export const UserValidation = {
    updateMyProfile,
};