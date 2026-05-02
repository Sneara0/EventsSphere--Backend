import { ICreateBookingRequest, IPaymentFulfillmentData, IUpdateBookingRequest } from './booking.interface.js';
import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums.js";
export declare const BookingService: {
    createBookingIntoDB: (userId: string, payload: ICreateBookingRequest) => Promise<{
        event: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("../../../generated/prisma/enums.js").EventStatus;
            isDeleted: boolean;
            time: string;
            title: string;
            description: string;
            category: string;
            dateTime: Date;
            location: string;
            venue: string;
            thumbnail: string | null;
            ticketPrice: number;
            totalSeats: number;
            availableSeats: number;
            airlineName: string | null;
            flightNumber: string | null;
            flightClass: string | null;
            baggageAllowance: string | null;
            isRefundable: boolean;
            organizerId: string;
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
    getSingleBookingFromDB: (id: string, user: any) => Promise<{
        user: {
            name: string;
            email: string;
            id: string;
        };
        event: {
            organizer: {
                name: string | null;
                email: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                contactNumber: string;
                organizationName: string | null;
                website: string | null;
                bio: string | null;
                logo: string | null;
                isVerified: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("../../../generated/prisma/enums.js").EventStatus;
            isDeleted: boolean;
            time: string;
            title: string;
            description: string;
            category: string;
            dateTime: Date;
            location: string;
            venue: string;
            thumbnail: string | null;
            ticketPrice: number;
            totalSeats: number;
            availableSeats: number;
            airlineName: string | null;
            flightNumber: string | null;
            flightClass: string | null;
            baggageAllowance: string | null;
            isRefundable: boolean;
            organizerId: string;
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
    fulfillBookingAfterPayment: (data: IPaymentFulfillmentData) => Promise<{
        user: {
            name: string;
            email: string;
        };
        event: {
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
    getMyBookingsFromDB: (userId: string) => Promise<({
        event: {
            title: string;
            dateTime: Date;
            location: string;
            thumbnail: string | null;
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
    })[]>;
    getAllBookingsFromDB: () => Promise<({
        user: {
            name: string;
            email: string;
        };
        payments: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            paymentStatus: PaymentStatus;
            transactionId: string;
            amount: number;
            currency: string;
            paymentMethod: string | null;
            invoiceUrl: string | null;
            bookingId: string;
        }[];
        event: {
            title: string;
            dateTime: Date;
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
    })[]>;
    cancelBookingFromDB: (id: string, user: any) => Promise<{
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
    deleteBookingByAdmin: (id: string) => Promise<{
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
    updateBookingStatusByAdmin: (id: string, payload: IUpdateBookingRequest) => Promise<{
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
