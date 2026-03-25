import { z } from "zod";

/**
 * ১. প্রোফাইল আপডেট করার জন্য ভ্যালিডেশন স্কিমা
 */
const updateMyProfile = z.object({
    body: z.object({
        name: z.string({
            // আপনার এরর অনুযায়ী এখানে শুধু message প্রপার্টি ব্যবহার করা নিরাপদ
            message: "Name must be a string", 
        }).optional(),
        
        image: z.string().url({
            message: "Image must be a valid URL",
        }).optional(),
        
        contactNumber: z.string()
            .min(10, { message: "Contact number must be at least 10 characters" })
            .max(15, { message: "Contact number cannot exceed 15 characters" })
            .optional(),
        
        address: z.string().optional(),
        
        bio: z.string().max(500, {
            message: "Bio cannot exceed 500 characters",
        }).optional(),
        
        organizationName: z.string().optional(),
    }),
});

export const UserValidation = {
    updateMyProfile,
};