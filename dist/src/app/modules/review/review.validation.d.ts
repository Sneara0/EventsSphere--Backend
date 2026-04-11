import { z } from 'zod';
export declare const ReviewValidation: {
    createReviewZodSchema: z.ZodObject<{
        body: z.ZodObject<{
            eventId: z.ZodString;
            rating: z.ZodNumber;
            comment: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
    updateReviewZodSchema: z.ZodObject<{
        body: z.ZodObject<{
            rating: z.ZodOptional<z.ZodNumber>;
            comment: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
