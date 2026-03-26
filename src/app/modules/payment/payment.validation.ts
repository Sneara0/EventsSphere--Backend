import { z } from 'zod';

const createPaymentSessionZodSchema = z.object({
  body: z.object({
    
    eventId: z.string().min(1, { message: "Event ID is required" }),
    couponCode: z.string().optional(),
  }),
});

export const PaymentValidation = {
  createPaymentSessionZodSchema,
};