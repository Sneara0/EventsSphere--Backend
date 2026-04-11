import { Request, Response } from 'express';
export declare const CouponController: {
    createCoupon: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    validateCoupon: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    getAllCoupons: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    updateCoupon: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
    deleteCoupon: (req: Request, res: Response, next: import("express").NextFunction) => Promise<void>;
};
