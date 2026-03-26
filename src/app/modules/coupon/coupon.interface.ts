export type ICouponCreatePayload = {
  code: string;
  discountValue: number;
  isPercentage: boolean;
  expiryDate: string | Date;
  usageLimit?: number;
  eventId?: string;
};

export type ICouponUpdatePayload = Partial<ICouponCreatePayload>;

export type ICheckCouponResponse = {
  isValid: boolean;
  discountAmount: number;
  finalAmount: number;
  couponId: string;
};