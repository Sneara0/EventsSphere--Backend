import { z } from "zod";

// ইভেন্ট তৈরি করার ভ্যালিডেশন
const createEventZodSchema = z.object({
    body: z.object({
        // ১. সরাসরি .min(1, "message") ব্যবহার করুন, এটি সব ভার্সনে কাজ করে
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        category: z.string().min(1, "Category is required"),
        dateTime: z.string().min(1, "DateTime is required"),
        time: z.string().min(1, "Time is required"),
        venue: z.string().min(1, "Venue (Airport) is required"),
        location: z.string().min(1, "Location (Arrival City) is required"),
        
        // ২. নাম্বারের ক্ষেত্রে অবজেক্ট বাদ দিয়ে চেইনিং ব্যবহার করুন
        totalSeats: z.preprocess(
            (val) => (val === "" || val === undefined ? undefined : Number(val)),
            z.number().positive("Total seats must be a positive number")
        ),
        
        ticketPrice: z.preprocess(
            (val) => (val === "" || val === undefined ? undefined : Number(val)),
            z.number().min(0, "Ticket price cannot be negative")
        ),
        
        thumbnail: z.string().optional(),

        // ৩. এয়ার টিকিট স্পেসিফিক ফিল্ডস
        airlineName: z.string().optional(),
        flightNumber: z.string().optional(),
        flightClass: z.string().optional(),
        baggageAllowance: z.string().optional(),
        isRefundable: z.preprocess((val) => {
            if (typeof val === "string") return val === "true" || val === "on";
            return Boolean(val);
        }, z.boolean().optional()),
    }),
});

// আপডেট করার ভ্যালিডেশন
const updateEventZodSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        dateTime: z.string().optional(),
        time: z.string().optional(),
        venue: z.string().optional(),
        location: z.string().optional(),
        totalSeats: z.preprocess(
            (val) => (val === "" || val === undefined ? undefined : Number(val)),
            z.number().optional()
        ),
        ticketPrice: z.preprocess(
            (val) => (val === "" || val === undefined ? undefined : Number(val)),
            z.number().optional()
        ),
        thumbnail: z.string().optional(),
        airlineName: z.string().optional(),
        flightNumber: z.string().optional(),
        flightClass: z.string().optional(),
        baggageAllowance: z.string().optional(),
        isRefundable: z.preprocess((val) => {
            if (typeof val === "string") return val === "true" || val === "on";
            return Boolean(val);
        }, z.boolean().optional()),
    }),
});

export const EventValidation = {
    createEventZodSchema,
    updateEventZodSchema,
};