import { Request, Response } from 'express';
export declare const BookingController: {
    createBooking: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getSingleBooking: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getMyBookings: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAllBookings: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateBookingStatus: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    cancelBooking: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteBooking: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
