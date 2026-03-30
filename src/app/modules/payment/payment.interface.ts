import { PaymentStatus } from "src/generated/prisma/enums";

// ১. Stripe Checkout Session তৈরি করার জন্য প্রয়োজনীয় ডাটা
export interface IPaymentSessionPayload {
  bookingId: string;
  userId: string;
  amount: number;       
  eventName: string;    
  userEmail: string;    
}

// ২. Stripe Webhook থেকে আসা Metadata-র জন্য টাইপ
export interface IStripeMetadata {
  bookingId: string;
  userId: string;
}

// ৩. ডাটাবেসের জন্য টাইপ (Updated with Optional Fields)
export interface IPaymentData {
  transactionId: string;
  amount: number;
  bookingId: string;
  userId: string;
  currency?: string;           // 👈 '?' যোগ করা হয়েছে (Optional)
  paymentStatus?: PaymentStatus; // 👈 '?' যোগ করা হয়েছে (Optional)
  paymentMethod?: string;
}

// ৪. ইনভয়েস PDF জেনারেট করার জন্য প্রয়োজনীয় ডাটা
export interface IInvoicePayload {
  userName: string;
  userEmail: string;
  bookingId: string;
  eventName: string;
  amount: number;
  transactionId: string;
  date: string;
}