import { z } from 'zod';

/**
 * ১. রিভিউ তৈরি করার সময় ভ্যালিডেশন
 */
const createReviewZodSchema = z.object({
  body: z.object({
    // অবজেক্টের বদলে সরাসরি .min() ব্যবহার করুন
    eventId: z.string().min(1, "Event ID is required"), 
    
    // number-এর ভেতর অবজেক্ট না দিয়ে সরাসরি min/max ব্যবহার করুন
    rating: z
      .number()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot be more than 5"),

    comment: z
      .string()
      .min(10, "Comment must be at least 10 characters long")
      .max(500, "Comment cannot exceed 500 characters"),
  }),
});

/**
 * ২. রিভিউ আপডেট করার সময় ভ্যালিডেশন
 */
const updateReviewZodSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().min(10).max(500).optional(),
  }),
});

export const ReviewValidation = {
  createReviewZodSchema,
  updateReviewZodSchema,
};