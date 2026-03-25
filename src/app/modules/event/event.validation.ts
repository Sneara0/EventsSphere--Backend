import { z } from "zod";

// ইভেন্ট তৈরি করার ভ্যালিডেশন
const createEventZodSchema = z.object({
    body: z.object({
        title: z.string({
            message: "Title is required and must be a string",
        }),
        description: z.string({
            message: "Description is required",
        }),
        category: z.string({
            message: "Category is required",
        }),
        date: z.string({
            message: "Date must be a valid ISO string",
        }),
        time: z.string({
            message: "Time is required",
        }),
        venue: z.string({
            message: "Venue is required",
        }),
        totalSeats: z.number({
            message: "Total seats must be a number",
        }),
        ticketPrice: z.number({
            message: "Ticket price must be a number",
        }).optional(),
        thumbnail: z.string().optional(),
    }),
});

// ইভেন্ট আপডেট করার ভ্যালিডেশন (সব ফিল্ড অপশনাল)
const updateEventZodSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        venue: z.string().optional(),
        totalSeats: z.number().optional(),
        ticketPrice: z.number().optional(),
        thumbnail: z.string().optional(),
    }),
});

export const EventValidation = {
    createEventZodSchema,
    updateEventZodSchema,
};