import { IReviewCreatePayload, IReviewUpdatePayload } from "./review.interface.js";
export declare const ReviewService: {
    createReviewIntoDB: (userId: string, payload: IReviewCreatePayload) => Promise<{
        user: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        eventId: string;
        rating: number;
        comment: string;
    }>;
    getEventReviewsFromDB: (eventId: string) => Promise<({
        user: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        eventId: string;
        rating: number;
        comment: string;
    })[]>;
    updateReviewInDB: (userId: string, reviewId: string, payload: IReviewUpdatePayload) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        eventId: string;
        rating: number;
        comment: string;
    }>;
    deleteReviewFromDB: (userId: string, reviewId: string) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        eventId: string;
        rating: number;
        comment: string;
    }>;
};
