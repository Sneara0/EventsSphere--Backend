import { z } from 'zod';
export declare const CouponValidation: {
    createCouponZodSchema: z.ZodObject<{
        body: z.ZodObject<{
            code: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
            discountValue: z.ZodNumber;
            isPercentage: z.ZodDefault<z.ZodBoolean>;
            expiryDate: z.ZodString;
            usageLimit: z.ZodOptional<z.ZodNumber>;
            eventId: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    updateCouponZodSchema: z.ZodObject<{
        body: z.ZodObject<{
            code: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
            discountValue: z.ZodOptional<z.ZodNumber>;
            isPercentage: z.ZodOptional<z.ZodBoolean>;
            expiryDate: z.ZodOptional<z.ZodString>;
            usageLimit: z.ZodOptional<z.ZodNumber>;
            eventId: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
