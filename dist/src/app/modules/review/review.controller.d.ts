import { Request, Response } from 'express';
export declare const ReviewController: {
    createReview: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getEventReviews: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateReview: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteReview: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
