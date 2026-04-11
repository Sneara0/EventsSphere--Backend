import { z } from "zod";
export declare const UserValidation: {
    updateMyProfile: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            profileImage: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
            address: z.ZodOptional<z.ZodString>;
            bio: z.ZodOptional<z.ZodString>;
            organizationName: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strip>;
};
