import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { CouponService } from './coupon.service.js';

const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.createCouponIntoDB(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: 'Coupon created', data: result });
});

const validateCoupon = catchAsync(async (req: Request, res: Response) => {
  const { code, eventId, originalAmount } = req.body;
  const result = await CouponService.validateAndCalculateDiscount(code, eventId, Number(originalAmount));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Coupon validated', data: result });
});

const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.getAllCouponsFromDB();
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Coupons retrieved', data: result });
});

const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const result = await CouponService.updateCouponInDB(req.params.id as string, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Coupon updated', data: result });
});

const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  await CouponService.deleteCouponFromDB(req.params.id as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: 'Coupon deleted', data: null });
});

export const CouponController = { createCoupon, validateCoupon, getAllCoupons, updateCoupon, deleteCoupon };