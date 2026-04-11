import { PaymentStatus } from "../../../generated/prisma/enums.js";
export interface IPaymentSessionPayload {
    bookingId: string;
    userId: string;
    amount: number;
    eventName: string;
    userEmail: string;
}
export interface IStripeMetadata {
    bookingId: string;
    userId: string;
}
export interface IPaymentData {
    transactionId: string;
    amount: number;
    bookingId: string;
    userId: string;
    currency?: string;
    paymentStatus?: PaymentStatus;
    paymentMethod?: string;
}
export interface IInvoicePayload {
    userName: string;
    userEmail: string;
    bookingId: string;
    eventName: string;
    amount: number;
    transactionId: string;
    date: string;
}
