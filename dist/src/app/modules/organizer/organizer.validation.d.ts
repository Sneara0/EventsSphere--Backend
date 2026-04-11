import { z } from "zod";
export declare const OrganizerValidation: {
    createOrganizer: z.ZodObject<{
        body: z.ZodObject<{
            organizationName: z.ZodOptional<z.ZodString>;
            contactNumber: z.ZodString;
            website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            bio: z.ZodOptional<z.ZodString>;
            logo: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    updateOrganizer: z.ZodObject<{
        body: z.ZodObject<{
            organizationName: z.ZodOptional<z.ZodString>;
            contactNumber: z.ZodOptional<z.ZodString>;
            website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
            bio: z.ZodOptional<z.ZodString>;
            logo: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>;
};
