import { z } from "zod";
// ১. ইভেন্ট ক্রিয়েট করার ভ্যালিডেশন
const createEventZodSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        category: z.string().min(1, "Category is required"),
        dateTime: z.string().min(1, "DateTime is required"),
        time: z.string().min(1, "Time is required"),
        venue: z.string().min(1, "Venue is required"),
        location: z.string().min(1, "Location is required"),
        // totalSeats: স্ট্রিং থেকে নাম্বারে রূপান্তর এবং পজিটিভ চেক
        totalSeats: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().positive("Total seats must be a positive number")),
        // ticketPrice: স্ট্রিং থেকে নাম্বারে রূপান্তর এবং মিনিমাম ০ চেক
        ticketPrice: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().min(0, "Ticket price cannot be negative")),
        thumbnail: z.string().optional(),
        airlineName: z.string().optional(),
        flightNumber: z.string().optional(),
        flightClass: z.string().optional(),
        baggageAllowance: z.string().optional(),
        // isRefundable: ফ্রন্টএন্ড থেকে আসা 'true'/'on' স্ট্রিংকে বুলিয়ানে রূপান্তর
        isRefundable: z.preprocess((val) => {
            if (val === "true" || val === "on" || val === true)
                return true;
            if (val === "false" || val === "off" || val === false)
                return false;
            return false;
        }, z.boolean().optional()),
    }),
});
// ২. ইভেন্ট আপডেট করার ভ্যালিডেশন (সবগুলো অপশনাল)
const updateEventZodSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        dateTime: z.string().optional(),
        time: z.string().optional(),
        venue: z.string().optional(),
        location: z.string().optional(),
        totalSeats: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
        ticketPrice: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
        thumbnail: z.string().optional(),
        airlineName: z.string().optional(),
        flightNumber: z.string().optional(),
        flightClass: z.string().optional(),
        baggageAllowance: z.string().optional(),
        isRefundable: z.preprocess((val) => {
            if (val === "true" || val === "on" || val === true)
                return true;
            if (val === "false" || val === "off" || val === false)
                return false;
            return undefined;
        }, z.boolean().optional()),
    }),
});
export const EventValidation = {
    createEventZodSchema,
    updateEventZodSchema,
};
