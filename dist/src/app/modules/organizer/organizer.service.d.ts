import { IOrganizerCreatePayload, IOrganizerUpdatePayload } from "./organizer.interface.js";
export declare const OrganizerService: {
    createProfileIntoDB: (userId: string, payload: IOrganizerCreatePayload) => Promise<{
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
    }>;
    getMyProfileFromDB: (userId: string) => Promise<{
        user: {
            name: string;
            email: string;
            image: string | null;
            role: import("../../../generated/prisma/enums.js").Role;
            status: import("../../../generated/prisma/enums.js").UserStatus;
        };
    } & {
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
    }>;
    updateMyProfileIntoDB: (userId: string, payload: IOrganizerUpdatePayload) => Promise<{
        user: {
            name: string;
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            emailVerified: boolean;
            image: string | null;
            role: import("../../../generated/prisma/enums.js").Role;
            status: import("../../../generated/prisma/enums.js").UserStatus;
            needPasswordChange: boolean;
            isDeleted: boolean;
            password: string | null;
            needPasswordReset: boolean;
            gender: import("../../../generated/prisma/enums.js").Gender | null;
            deletedAt: Date | null;
        };
    } & {
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
    }>;
    getAllOrganizersFromDB: (filters: any) => Promise<({
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
        userId: string;
        contactNumber: string;
        organizationName: string | null;
        website: string | null;
        bio: string | null;
        logo: string | null;
        isVerified: boolean;
    })[]>;
    getSingleOrganizerFromDB: (id: string) => Promise<{
        user: {
            name: string;
            image: string | null;
        };
        events: {
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
        }[];
    } & {
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
    }>;
};
