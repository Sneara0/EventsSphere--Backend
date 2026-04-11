import { z } from 'zod';
/**
 * ১. কুপন তৈরি করার ভ্যালিডেশন
 */
const createCouponZodSchema = z.object({
    body: z.object({
        // অবজেক্টের বদলে সরাসরি .min(1, "Message") ব্যবহার করুন
        code: z
            .string()
            .min(1, "Coupon code is required")
            .transform((val) => val.toUpperCase()), // এটি স্ট্রিংকে বড় হাতের অক্ষরে রূপান্তর করবে
        discountValue: z
            .number()
            .positive("Discount value must be a positive number"),
        isPercentage: z.boolean().default(false),
        expiryDate: z
            .string()
            .min(1, "Expiry date is required"),
        usageLimit: z
            .number()
            .int()
            .positive()
            .optional(),
        eventId: z
            .string()
            .uuid("Invalid Event ID format")
            .optional(),
    }),
});
/**
 * ২. কুপন আপডেট করার ভ্যালিডেশন
 */
const updateCouponZodSchema = z.object({
    body: z.object({
        code: z
            .string()
            .optional()
            .transform((val) => val?.toUpperCase()),
        discountValue: z.number().positive().optional(),
        isPercentage: z.boolean().optional(),
        expiryDate: z.string().optional(),
        usageLimit: z.number().int().positive().optional(),
        eventId: z.string().uuid().optional(),
    }),
});
export const CouponValidation = {
    createCouponZodSchema,
    updateCouponZodSchema,
};
