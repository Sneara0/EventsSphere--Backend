export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

/**
 * ১. ক্লায়েন্ট থেকে আসা ডেটার ইন্টারফেস (Payload)
 */
export type IBookingCreatePayload = {
  eventId: string;
  quantity?: number; // ডিফল্ট ১ থাকবে, তবে চাইলে ইউজার বেশি দিতে পারে
};

/**
 * ২. কুয়েরি ফিল্টার করার ইন্টারফেস (Admin বা Organizer এর জন্য)
 */
export type IBookingFilterRequest = {
  searchTerm?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  eventId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
};

/**
 * ৩. পেজিনেশন এবং সর্টিং অপশন
 */
export type IPaginationOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

/**
 * ৪. সার্ভিসের ভেতরে ব্যবহারের জন্য এক্সটেন্ডেড টাইপ (ঐচ্ছিক)
 */
export interface IBookingResponse {
  id: string;
  userId: string;
  eventId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  ticketUrl?: string | null;
  isTicketGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}