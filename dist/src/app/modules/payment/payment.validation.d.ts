import { z } from 'zod';
export declare const PaymentValidation: {
    createPaymentSessionZodSchema: z.ZodObject<{
        body: z.ZodObject<{
            eventId: z.ZodString;
            couponCode: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
