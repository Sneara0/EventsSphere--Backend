import { z } from "zod";

/**
 * ১. প্রোফাইল আপডেট করার জন্য বুলেটপ্রুফ ভ্যালিডেশন স্কিমা
 * সমাধান: ফ্রন্টএন্ড থেকে পাঠানো 'phone' এবং 'profileImage' এর সাথে নাম সিঙ্ক করা হয়েছে।
 */
const updateMyProfile = z.object({
    body: z.object({
        name: z.string()
            .describe("User's full name")
            .optional(),
        
        // ফ্রন্টএন্ড থেকে আসা profileImage-এর জন্য
        profileImage: z.string()
            .url("Image must be a valid URL")
            .optional(),
        
        // ফ্রন্টএন্ড থেকে আসা phone-এর জন্য
        phone: z.string()
            .min(10, "Phone number must be at least 10 characters")
            .max(15, "Phone number cannot exceed 15 characters")
            .optional(),
        
        address: z.string().optional(),
        
        bio: z.string()
            .max(500, "Bio cannot exceed 500 characters")
            .optional(),
        
        organizationName: z.string().optional(),
    }).strict(), // এর মাধ্যমে অতিরিক্ত বা ভুল নামের ফিল্ড পাঠানো বন্ধ করা হয়েছে
});

export const UserValidation = {
    updateMyProfile,
};