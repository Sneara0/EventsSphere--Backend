import { z } from "zod";
export declare const EventValidation: {
    createEventZodSchema: z.ZodObject<{
        body: z.ZodObject<{
            title: z.ZodString;
            description: z.ZodString;
            category: z.ZodString;
            dateTime: z.ZodString;
            time: z.ZodString;
            venue: z.ZodString;
            location: z.ZodString;
            totalSeats: z.ZodPipe<z.ZodTransform<number | undefined, unknown>, z.ZodNumber>;
            ticketPrice: z.ZodPipe<z.ZodTransform<number | undefined, unknown>, z.ZodNumber>;
            thumbnail: z.ZodOptional<z.ZodString>;
            airlineName: z.ZodOptional<z.ZodString>;
            flightNumber: z.ZodOptional<z.ZodString>;
            flightClass: z.ZodOptional<z.ZodString>;
            baggageAllowance: z.ZodOptional<z.ZodString>;
            isRefundable: z.ZodPipe<z.ZodTransform<boolean, unknown>, z.ZodOptional<z.ZodBoolean>>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    updateEventZodSchema: z.ZodObject<{
        body: z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            category: z.ZodOptional<z.ZodString>;
            dateTime: z.ZodOptional<z.ZodString>;
            time: z.ZodOptional<z.ZodString>;
            venue: z.ZodOptional<z.ZodString>;
            location: z.ZodOptional<z.ZodString>;
            totalSeats: z.ZodPipe<z.ZodTransform<number | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
            ticketPrice: z.ZodPipe<z.ZodTransform<number | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
            thumbnail: z.ZodOptional<z.ZodString>;
            airlineName: z.ZodOptional<z.ZodString>;
            flightNumber: z.ZodOptional<z.ZodString>;
            flightClass: z.ZodOptional<z.ZodString>;
            baggageAllowance: z.ZodOptional<z.ZodString>;
            isRefundable: z.ZodPipe<z.ZodTransform<boolean | undefined, unknown>, z.ZodOptional<z.ZodBoolean>>;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
