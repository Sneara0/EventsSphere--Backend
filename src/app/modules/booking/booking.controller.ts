import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from 'src/app/utils/catchAsync';
import { BookingService } from './booking.service';
import { sendResponse } from 'src/app/utils/sendResponse';
import { prisma } from 'src/app/lib/prisma';

/**
 * ১. নতুন বুকিং তৈরি করা
 */
const createBooking = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user; 
  const payload = req.body;

  const result = await BookingService.createBookingIntoDB(user.id as string, payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Booking completed and ticket generated successfully!',
    data: result,
  });
});

/**
 * ২. ইউজারের নিজের সব বুকিং দেখা
 */
const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;

  const result = await BookingService.getMyBookingsFromDB(user.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My bookings retrieved successfully!',
    data: result,
  });
});

/**
 * ৩. বুকিং এর বিস্তারিত দেখা
 */
const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // টাইপ এরর ফিক্স করতে 'as string' ব্যবহার করা হয়েছে
    const result = await prisma.booking.findUnique({
        where: { id: id as string },
        include: { event: true }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Booking details retrieved successfully!',
        data: result,
    });
});

/**
 * ৪. বুকিং ডিলিট বা ক্যানসেল করা (নতুন যুক্ত করা হয়েছে)
 */
const deleteBooking = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { id } = req.params;

    const result = await BookingService.deleteBookingFromDB(user.id as string, id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Booking deleted and seat restored successfully!',
        data: result,
    });
});

export const BookingController = {
  createBooking,
  getMyBookings,
  getSingleBooking,
  deleteBooking 
};