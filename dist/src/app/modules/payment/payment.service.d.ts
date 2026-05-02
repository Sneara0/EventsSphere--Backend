import { IPaymentSessionPayload, IPaymentData } from './payment.interface.js';
import { BookingStatus, PaymentStatus } from '../../../generated/prisma/enums.js';
export declare const PaymentService: {
    createCheckoutSession: (payload: IPaymentSessionPayload) => Promise<string | null>;
    fulfillOrder: (data: IPaymentData) => Promise<{
        user: {
            name: string;
            email: string;
        };
        event: {
            id: string;
            title: string;
            dateTime: Date;
            location: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: BookingStatus;
        userId: string;
        eventId: string;
        paymentStatus: PaymentStatus;
        quantity: number;
        totalAmount: number;
        transactionId: string | null;
        ticketUrl: string | null;
        isTicketGenerated: boolean;
        bookingCode: string;
    }>;
};
