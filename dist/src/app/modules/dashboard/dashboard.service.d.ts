export declare const DashboardService: {
    getAdminStats: () => Promise<{
        userCounts: (import("../../../generated/prisma/internal/prismaNamespace.js").PickEnumerable<import("../../../generated/prisma/models.js").UserGroupByOutputType, "role"[]> & {
            _count: number;
        })[];
        eventStats: (import("../../../generated/prisma/internal/prismaNamespace.js").PickEnumerable<import("../../../generated/prisma/models.js").EventGroupByOutputType, "status"[]> & {
            _count: number;
        })[];
        revenueStats: import("../../../generated/prisma/models.js").GetBookingAggregateType<{
            where: {
                paymentStatus: "PAID";
            };
            _sum: {
                totalAmount: true;
            };
            _count: {
                id: true;
            };
        }>;
        topSellingEvents: {
            id: string;
            _count: {
                bookings: number;
            };
            title: string;
        }[];
    }>;
    getOrganizerStats: (organizerId: string) => Promise<{
        totalEvents: number;
        totalSales: number;
        totalEarnings: number;
        eventPerformance: {
            id: string;
            title: string;
            sales: number;
            avgRating: number;
        }[];
    }>;
    getUserStats: (userId: string) => Promise<{
        upcomingEvents: ({
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
            status: import("../../../generated/prisma/enums.js").BookingStatus;
            userId: string;
            eventId: string;
            paymentStatus: import("../../../generated/prisma/enums.js").PaymentStatus;
            quantity: number;
            totalAmount: number;
            transactionId: string | null;
            ticketUrl: string | null;
            isTicketGenerated: boolean;
            bookingCode: string;
        })[];
        pastEvents: ({
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
            status: import("../../../generated/prisma/enums.js").BookingStatus;
            userId: string;
            eventId: string;
            paymentStatus: import("../../../generated/prisma/enums.js").PaymentStatus;
            quantity: number;
            totalAmount: number;
            transactionId: string | null;
            ticketUrl: string | null;
            isTicketGenerated: boolean;
            bookingCode: string;
        })[];
        totalSpent: number;
        myReviews: ({
            event: {
                title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            eventId: string;
            rating: number;
            comment: string;
        })[];
    }>;
};
