import { IEventCreatePayload, IEventFilterRequest } from "./event.interface.js";
export declare const EventService: {
    createEventIntoDB: (userId: string, payload: IEventCreatePayload) => Promise<{
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
    }>;
    getAllEventsFromDB: (filters: IEventFilterRequest) => Promise<({
        organizer: {
            user: {
                name: string;
                image: string | null;
            };
        } & {
            name: string | null;
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            contactNumber: string;
            userId: string;
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
    })[]>;
    getSingleEventFromDB: (id: string) => Promise<{
        organizer: {
            user: {
                name: string;
                email: string;
                image: string | null;
            };
        } & {
            name: string | null;
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            contactNumber: string;
            userId: string;
            organizationName: string | null;
            website: string | null;
            bio: string | null;
            logo: string | null;
            isVerified: boolean;
        };
        reviews: ({
            user: {
                name: string;
                image: string | null;
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
    }>;
    updateEventIntoDB: (eventId: string, userId: string, payload: Partial<IEventCreatePayload>) => Promise<{
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
    }>;
    deleteEventFromDB: (eventId: string, userId: string) => Promise<{
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
    }>;
};
