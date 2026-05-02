import { ICouponCreatePayload, ICouponUpdatePayload } from "./coupon.interface.js";
export declare const CouponService: {
    createCouponIntoDB: (payload: ICouponCreatePayload) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        eventId: string | null;
        discountValue: number;
        isPercentage: boolean;
        expiryDate: Date;
        usageLimit: number;
        usedCount: number;
        isActive: boolean;
    }>;
    validateAndCalculateDiscount: (code: string, eventId: string, originalAmount: number) => Promise<{
        isValid: boolean;
        couponId: string;
        couponCode: string;
        discountAmount: number;
        finalAmount: number;
    }>;
    updateCouponInDB: (id: string, payload: ICouponUpdatePayload) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        eventId: string | null;
        discountValue: number;
        isPercentage: boolean;
        expiryDate: Date;
        usageLimit: number;
        usedCount: number;
        isActive: boolean;
    }>;
    deleteCouponFromDB: (id: string) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        eventId: string | null;
        discountValue: number;
        isPercentage: boolean;
        expiryDate: Date;
        usageLimit: number;
        usedCount: number;
        isActive: boolean;
    }>;
    getAllCouponsFromDB: () => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        eventId: string | null;
        discountValue: number;
        isPercentage: boolean;
        expiryDate: Date;
        usageLimit: number;
        usedCount: number;
        isActive: boolean;
    }[]>;
};
