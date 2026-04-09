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

    // ১. ডাটা এক্সট্রাক্ট করা (Zod middleware-এর পর ডাটা req.body.body তে থাকতে পারে)
    const payload = req.body.body ? { ...req.body.body } : { ...req.body };

    // --- DEBUG LOGS: সমস্যা ধরার জন্য ---
    console.log("🛠️ Logged User ID:", user?.userId);
    console.log("📦 Incoming Payload:", payload);
    // ---------------------------------

    // ২. ইমেজ হ্যান্ডলিং (Cloudinary URL যদি multer ব্যবহার করেন)
    if (req.file) {
        payload.thumbnail = req.file.path; 
    }

    // ৩. ডাটা টাইপ কনভার্সন (FormData থেকে স্ট্রিং আসে, তাই নাম্বারে রূপান্তর জরুরি)
    if (payload.totalSeats) {
        payload.totalSeats = Number(payload.totalSeats);
    }
    if (payload.ticketPrice) {
        payload.ticketPrice = Number(payload.ticketPrice);
    }
    
    // ৪. বুলিয়ান হ্যান্ডলিং
    if (payload.isRefundable !== undefined) {
        payload.isRefundable = 
            payload.isRefundable === 'true' || 
            payload.isRefundable === 'on' || 
            payload.isRefundable === true;
    }

    // ৫. সার্ভিস কল করা (নিশ্চিত হোন আপনার সার্ভিসে এই ফাংশন নাম আছে)
    const result = await EventService.createEventIntoDB(user.userId, payload);

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Flight offer launched successfully! ✈️",
        data: result,
    });
});

/**
 * 2. Get All Flight Offers
 */
const getAllEvents = catchAsync(async (req: Request, res: Response) => {
    const result = await EventService.getAllEventsFromDB(req.query);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Flight offers fetched successfully",
        data: result,
    });
});

/**
 * 3. Get Single Flight Details
 */
const getSingleEvent = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params; 
    const result = await EventService.getSingleEventFromDB(id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Flight details fetched successfully",
        data: result,
    });
});

/**
 * 4. Update Flight Offer
 */
const updateEvent = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params; 
    const user = req.user as IRequestUser;

    const updateData = req.body.body ? { ...req.body.body } : { ...req.body };
    
    if (req.file) {
        updateData.thumbnail = req.file.path;
    }

    if (updateData.totalSeats) updateData.totalSeats = Number(updateData.totalSeats);
    if (updateData.ticketPrice !== undefined) updateData.ticketPrice = Number(updateData.ticketPrice);
    
    if (updateData.isRefundable !== undefined) {
        updateData.isRefundable = 
            updateData.isRefundable === 'true' || 
            updateData.isRefundable === 'on' || 
            updateData.isRefundable === true;
    }

    const result = await EventService.updateEventIntoDB(id as string, user.userId, updateData);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Flight offer updated successfully",
        data: result,
    });
});

/**
 * 5. Delete an Offer
 */
const deleteEvent = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user as IRequestUser;

    const result = await EventService.deleteEventFromDB(id as string, user.userId);

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