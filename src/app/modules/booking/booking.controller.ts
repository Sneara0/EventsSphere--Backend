import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { BookingService } from './booking.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';

/**
 * 1. User: Create a new booking
 */
const createBooking = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!; 
  const result = await BookingService.createBookingIntoDB(user.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Booking initiated successfully! Please complete the payment.',
    data: result,
  });
});

/**
 * 2. User/Admin: Get a single booking by ID
 * (সিকিউরিটি আপডেট: ইউজার শুধুমাত্র নিজের বুকিং দেখতে পারবে, এডমিন সব পারবে)
 */
const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  // সার্ভিসে আইডি এবং ইউজার ইনফো দুটোই পাঠানো হচ্ছে সিকিউরিটি চেক করার জন্য
  const result = await BookingService.getSingleBookingFromDB(id as string, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking details fetched successfully!',
    data: result,
  });
});

/**
 * 3. User: Get personal booking history
 */
const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const result = await BookingService.getMyBookingsFromDB(user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My bookings fetched successfully!',
    data: result,
  });
});

/**
 * 4. Admin: Get all bookings (For Management)
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
 * 5. Admin: Update booking status
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
 * 6. User/Admin: Cancel Booking (নতুন যোগ করা হয়েছে)
 * পেমেন্ট পেন্ডিং থাকলে ইউজার নিজেই ক্যানসেল করতে পারবে
 */
const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  
  const result = await BookingService.cancelBookingFromDB(id as string, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking cancelled successfully!',
    data: result,
  });
});

/**
 * 7. Admin: Delete a booking (Permanently)
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
  getSingleBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking, // Exported
  deleteBooking,
};