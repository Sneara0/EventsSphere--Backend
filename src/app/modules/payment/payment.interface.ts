import { PaymentStatus } from "src/generated/prisma/enums";


// ১. Stripe Checkout Session তৈরি করার জন্য প্রয়োজনীয় ডাটা
export interface IPaymentSessionPayload {
  bookingId: string;
  userId: string;
  amount: number;       // ফাইনাল ডিসকাউন্টেড অ্যামাউন্ট (ডলারে)
  eventName: string;    // ইভেন্টের নাম যা Stripe Checkout পেজে দেখাবে
  userEmail: string;    // কাস্টমারের ইমেইল (Receipt পাঠানোর জন্য)
}

// ২. Stripe Webhook থেকে আসা Metadata-র জন্য টাইপ
// Stripe মেটাডাটাতে সব ডাটা String হিসেবে থাকে
export interface IStripeMetadata {
  bookingId: string;
  userId: string;
}

// ৩. আমাদের ডাটাবেসের Payment মডেলে ডাটা সেভ করার জন্য টাইপ
export interface IPaymentData {
  transactionId: string;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus; // Enum: PENDING, PAID, FAILED
  paymentMethod?: string;
  bookingId: string;
  userId: string;
}

// ৪. ইনভয়েস PDF জেনারেট করার জন্য প্রয়োজনীয় ডাটা
export interface IInvoicePayload {
  userName: string;
  userEmail: string;
  bookingId: string;
  eventName: string;
  amount: number;
  transactionId: string;
  date: string;
}