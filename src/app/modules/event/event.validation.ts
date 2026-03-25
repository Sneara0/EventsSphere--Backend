import { z } from "zod";

/**
 * ১. ইভেন্ট ক্রিয়েট করার জন্য ভ্যালিডেশন স্কিমা
 */
const createEvent = z.object({
    body: z.object({
        title: z.string({
            required_error: "Title is required",
        }).min(5, "Title must be at least 5 characters"),
        
        description: z.string({
            required_error: "Description is required",
        }).min(20, "Description must be at least 20 characters"),
        
        category: z.string({
            required_error: "Category is required",
        }),
        
        date: z.string({
            required_error: "Date is required",
        }).refine((date) => new Date(date) > new Date(), {
            message: "Event date must be in the future",
        }),
        
        time: z.string({
            required_error: "Time is required",
        }),
        
        venue: z.string({
            required_error: "Venue/Location is required",
        }),
        
        totalSeats: z.number({
            required_error: "Total seats is required",
        }).int().positive("Total seats must be a positive number"),
        
        ticketPrice: z.number().nonnegative("Price cannot be negative").default(0),
        
        thumbnail: z.string().url("Thumbnail must be a valid URL").optional(),
    }),
});

/**
 * ২. ইভেন্ট আপডেট করার জন্য ভ্যালিডেশন স্কিমা
 * (সব ফিল্ড অপশনাল রাখা হয়েছে যাতে আংশিক আপডেট করা যায়)
 */
const updateEvent = z.object({
    body: z.object({
        title: z.string().min(5).optional(),
        description: z.string().min(20).optional(),
        category: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        venue: z.string().optional(),
        totalSeats: z.number().int().positive().optional(),
        ticketPrice: z.number().nonnegative().optional(),
        thumbnail: z.string().url().optional(),
        status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
    }),
});

export const EventValidation = {
    createEvent,
    updateEvent,
};