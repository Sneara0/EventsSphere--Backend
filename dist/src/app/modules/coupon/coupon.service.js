import httpStatus from 'http-status';
import { prisma } from "../../lib/prisma";
import AppError from '../../errorHelpers/AppError';
const createCouponIntoDB = async (payload) => {
    const isExists = await prisma.coupon.findUnique({ where: { code: payload.code } });
    if (isExists)
        throw new AppError(httpStatus.BAD_REQUEST, "Coupon code already exists");
    return await prisma.coupon.create({
        data: { ...payload, expiryDate: new Date(payload.expiryDate) }
    });
};
const validateAndCalculateDiscount = async (code, eventId, originalAmount) => {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon)
        throw new AppError(httpStatus.NOT_FOUND, "Invalid coupon code");
    if (new Date() > new Date(coupon.expiryDate))
        throw new AppError(httpStatus.BAD_REQUEST, "Coupon expired");
    if (coupon.usedCount >= coupon.usageLimit)
        throw new AppError(httpStatus.BAD_REQUEST, "Usage limit reached");
    if (coupon.eventId && coupon.eventId !== eventId)
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid for this event");
    let discountAmount = coupon.isPercentage ? (originalAmount * coupon.discountValue) / 100 : coupon.discountValue;
    const finalAmount = Math.max(0, originalAmount - discountAmount);
    return { isValid: true, couponId: coupon.id, couponCode: coupon.code, discountAmount, finalAmount };
};
const updateCouponInDB = async (id, payload) => {
    if (payload.expiryDate)
        payload.expiryDate = new Date(payload.expiryDate);
    return await prisma.coupon.update({ where: { id }, data: payload });
};
const deleteCouponFromDB = async (id) => {
    return await prisma.coupon.delete({ where: { id } });
};
const getAllCouponsFromDB = async () => {
    return await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
};
export const CouponService = {
    createCouponIntoDB,
    validateAndCalculateDiscount,
    updateCouponInDB,
    deleteCouponFromDB,
    getAllCouponsFromDB
};
