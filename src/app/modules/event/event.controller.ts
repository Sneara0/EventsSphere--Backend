import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { EventService } from "./event.service";
import { IRequestUser } from "../../interfaces/requestUser.interface";

/**
 * 1. Create a New Flight/Event Offer
 */
const createEvent = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;

    // ইমেজ হ্যান্ডলিং (Cloudinary/Multer পাথ থেকে থাম্বনেইল সেট করা)
    if (req.file) {
        req.body.thumbnail = req.file.path;
    }

    // ডাটা কাস্টিং: FormData থেকে আসা স্ট্রিংগুলোকে সঠিক টাইপে রূপান্তর
    const payload = {
        ...req.body,
        totalSeats: Number(req.body.totalSeats),
        ticketPrice: Number(req.body.ticketPrice || 0),
        // Boolean হ্যান্ডলিং: ফ্রন্টএন্ড চেকবক্স থেকে 'on' অথবা 'true' আসলে সেটি true হবে
        isRefundable: req.body.isRefundable === 'true' || req.body.isRefundable === 'on',
    };

    const result = await EventService.createEventIntoDB(user.userId, payload);

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Flight offer launched successfully! ✈️",
        data: result,
    });
});

/**
 * 2. Get All Flight Offers (With Filtering)
 */
const getAllEvents = catchAsync(async (req: Request, res: Response) => {
    const filters = req.query;
    const result = await EventService.getAllEventsFromDB(filters as any);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Flight offers fetched successfully",
        data: result,
    });
});

/**
 * 3. Get Single Flight Details by ID
 */
const getSingleEvent = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string; 
    const result = await EventService.getSingleEventFromDB(id);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Flight details fetched successfully",
        data: result,
    });
});

/**
 * 4. Update Flight/Event Offer
 */
const updateEvent = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string; 
    const user = req.user as IRequestUser;

    // যদি নতুন ইমেজ আপলোড করা হয়
    if (req.file) {
        req.body.thumbnail = req.file.path;
    }

    // আপডেট পেলোডে নাম্বার ভ্যালুগুলো নিশ্চিত করা
    if (req.body.totalSeats) req.body.totalSeats = Number(req.body.totalSeats);
    if (req.body.ticketPrice) req.body.ticketPrice = Number(req.body.ticketPrice);
    
    // Boolean আপডেট হ্যান্ডলিং
    if (req.body.isRefundable !== undefined) {
        req.body.isRefundable = req.body.isRefundable === 'true' || req.body.isRefundable === 'on';
    }

    const result = await EventService.updateEventIntoDB(id, user.userId, req.body);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Flight offer updated successfully",
        data: result,
    });
});

/**
 * 5. Soft Delete an Offer
 */
const deleteEvent = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = req.user as IRequestUser;

    const result = await EventService.deleteEventFromDB(id, user.userId);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Flight offer deleted successfully",
        data: result,
    });
});

export const EventController = {
    createEvent,
    getAllEvents,
    getSingleEvent,
    updateEvent,
    deleteEvent,
};