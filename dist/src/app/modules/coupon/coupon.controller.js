import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { CouponService } from './coupon.service';
const createCoupon = catchAsync(async (req, res) => {
    const result = await CouponService.createCouponIntoDB(req.body);
    sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: 'Coupon created', data: result });
});
const validateCoupon = catchAsync(async (req, res) => {
    const { code, eventId, originalAmount } = req.body;
    const result = await CouponService.validateAndCalculateDiscount(code, eventId, Number(originalAmount));
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Coupon validated', data: result });
});
const getAllCoupons = catchAsync(async (req, res) => {
    const result = await CouponService.getAllCouponsFromDB();
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Coupons retrieved', data: result });
});
const updateCoupon = catchAsync(async (req, res) => {
    const result = await CouponService.updateCouponInDB(req.params.id, req.body);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Coupon updated', data: result });
});
const deleteCoupon = catchAsync(async (req, res) => {
    await CouponService.deleteCouponFromDB(req.params.id);
    sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Coupon deleted', data: null });
});
export const CouponController = { createCoupon, validateCoupon, getAllCoupons, updateCoupon, deleteCoupon };
