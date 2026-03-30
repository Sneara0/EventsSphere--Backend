import { Request, Response } from 'express';
import httpStatus from 'http-status';

import { BookingService } from './booking.service';
import { catchAsync } from 'src/app/utils/catchAsync';
import { sendResponse } from 'src/app/utils/sendResponse';

/**
 * 1. User: Create a new booking
 */
const createBooking = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user; // Auth Middleware থেকে আসা ইউজার ডাটা
  const result = await BookingService.createBookingIntoDB(user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking initiated successfully! Please complete the payment.',
    data: result,
  });
});

/**
 * 2. User: Get personal booking history
 */
const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await BookingService.getMyBookingsFromDB(user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My bookings fetched successfully!',
    data: result,
  });
});

/**
 * 3. Admin: Get all bookings for management
 */
const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await BookingService.getAllBookingsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All bookings fetched successfully!',
    data: result,
  });
});

/**
 * 4. Admin: Update booking status manually
 */
const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.updateBookingStatusByAdmin(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking status updated successfully!',
    data: result,
  });
});

/**
 * 5. Admin: Delete a booking
 */
const deleteBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.deleteBookingByAdmin(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking deleted and seats restored successfully!',
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
};