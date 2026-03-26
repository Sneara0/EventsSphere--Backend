import { z } from "zod";

/**
 * ১. বুকিং তৈরি করার ভ্যালিডেশন
 */
const createBooking = z.object({
  body: z.object({
    eventId: z
      .string()
      .min(1, "Event ID is required to book tickets")
      .uuid("Invalid Event ID format"), 
    
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .positive("Quantity must be at least 1")
      .optional()
      .default(1),
  }),
});

/**
 * ২. বুকিং স্ট্যাটাস বা পেমেন্ট আপডেট করার ভ্যালিডেশন
 */
const updateBookingStatus = z.object({
  body: z.object({
    // ✅ সরাসরি স্ট্রিং মেসেজ পাস করুন, এতে ওভারলোড এরর আসবে না
    status: z
      .enum(["PENDING", "CONFIRMED", "CANCELLED"], {
        error: "Invalid booking status", // কিছু ভার্সনে 'error' কাজ করে
      })
      .optional()
      .or(z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional()), 

    // বিকল্প এবং সবচেয়ে নিরাপদ উপায়:
    paymentStatus: z
      .enum(["UNPAID", "PAID", "REFUNDED"])
      .optional(),

    transactionId: z.string().optional(),
    ticketUrl: z.string().url("Invalid ticket URL format").optional(),
  }),
});

export const BookingValidation = {
  createBooking,
  updateBookingStatus,
};