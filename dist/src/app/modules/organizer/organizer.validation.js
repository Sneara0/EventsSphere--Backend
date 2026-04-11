import { z } from "zod";
/**
 * অর্গানাইজার প্রোফাইল তৈরি করার জন্য ভ্যালিডেশন স্কিমা
 * এখানে 'required_error' এর বদলে 'message' ব্যবহার করা হয়েছে
 */
const createOrganizer = z.object({
    body: z.object({
        organizationName: z.string({
            message: "Organization name must be a string",
        })
            .min(3, { message: "Organization name must be at least 3 characters" })
            .optional(),
        contactNumber: z.string({
            // ✅ আপনার Zod ভার্সন অনুযায়ী 'message' ব্যবহার করুন
            message: "Contact number is required",
        }),
        // .or(z.literal("")) ব্যবহার করা হয়েছে যাতে খালি স্ট্রিং পাঠালেও এরর না দেয়
        website: z.string()
            .url({ message: "Invalid URL" })
            .optional()
            .or(z.literal("")),
        bio: z.string()
            .max(500, { message: "Bio cannot exceed 500 characters" })
            .optional(),
        logo: z.string().url({ message: "Logo must be a valid URL" }).optional(),
    }),
});
// আপডেট করার জন্য আলাদা একটি স্কিমা (সবগুলো অপশনাল)
const updateOrganizer = z.object({
    body: z.object({
        organizationName: z.string().min(3).optional(),
        contactNumber: z.string().optional(),
        website: z.string().url().optional().or(z.literal("")),
        bio: z.string().max(500).optional(),
        logo: z.string().url().optional(),
    }),
});
export const OrganizerValidation = {
    createOrganizer,
    updateOrganizer,
};
