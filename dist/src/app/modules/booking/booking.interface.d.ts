import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums.js";
/**
 * 1. User: Booking request payload from frontend
 */
export type ICreateBookingRequest = {
    eventId: string;
    quantity: number;
};
/**
 * 2. Admin: Manual status or payment status update
 */
export type IUpdateBookingRequest = {
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
};
/**
 * 3. Filters: Used for searching bookings in admin panel
 */
export type IBookingFilters = {
    searchTerm?: string;
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    eventId?: string;
    userId?: string;
};
/**
 * 4. Dashboard Stats: Summary data for the super admin
 */
export type IAdminDashboardStats = {
    totalBookings: number;
    totalRevenue: number;
    confirmedBookings: number;
    pendingBookings: number;
    totalSoldTickets: number;
};
/**
 * 5. Payment Fulfillment: Data from Stripe/Payment Webhook
 * এই টাইপটি মিসিং ছিল বলেই আপনার সার্ভিস ফাইলে এরর আসছিল।
 */
export type IPaymentFulfillmentData = {
    transactionId: string;
    bookingId: string;
    userId: string;
    amount: number;
    invoiceUrl?: string;
};
