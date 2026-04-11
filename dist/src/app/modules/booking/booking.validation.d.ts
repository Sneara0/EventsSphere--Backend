import { z } from "zod";
export declare const BookingValidation: {
    createBooking: z.ZodObject<{
        body: z.ZodObject<{
            eventId: z.ZodString;
            quantity: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    updateBookingStatus: z.ZodObject<{
        body: z.ZodObject<{
            status: z.ZodUnion<[z.ZodOptional<z.ZodEnum<{
                CANCELLED: "CANCELLED";
                PENDING: "PENDING";
                CONFIRMED: "CONFIRMED";
            }>>, z.ZodOptional<z.ZodEnum<{
                CANCELLED: "CANCELLED";
                PENDING: "PENDING";
                CONFIRMED: "CONFIRMED";
            }>>]>;
            paymentStatus: z.ZodOptional<z.ZodEnum<{
                UNPAID: "UNPAID";
                PAID: "PAID";
                REFUNDED: "REFUNDED";
            }>>;
            transactionId: z.ZodOptional<z.ZodString>;
            ticketUrl: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
