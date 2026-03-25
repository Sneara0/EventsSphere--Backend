import { Request, Response } from "express";
import status from "http-status";
import { EventService } from "./event.service";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

// ১. ইভেন্ট তৈরি করা (ইমেজ আপলোডসহ)
const createEvent = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    
    // Cloudinary থেকে পাওয়া ইমেজের পাথ সেট করা
    if (req.file) {
        req.body.thumbnail = req.file.path; 
    }

    // FormData থেকে আসা স্ট্রিং ভ্যালুগুলোকে নাম্বারে কনভার্ট করা
    const payload = {
        ...req.body,
        totalSeats: Number(req.body.totalSeats),
        ticketPrice: Number(req.body.ticketPrice || 0),
    };

    const result = await EventService.createEventIntoDB(user.userId, payload);

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Event created successfully",
        data: result,
    });
});

// ২. সব ইভেন্ট পাওয়া (সার্চ ও ফিল্টারসহ)
const getAllEvents = catchAsync(async (req: Request, res: Response) => {
    const filters = req.query; // searchTerm, category, minPrice, maxPrice ইত্যাদি
    const result = await EventService.getAllEventsFromDB(filters as any);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Events fetched successfully",
        data: result,
    });
});

// ৩. সিঙ্গেল ইভেন্ট দেখা
const getSingleEvent = catchAsync(async (req: Request, res: Response) => {
    const result = await EventService.getSingleEventFromDB(req.params.id);
    
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Event details fetched successfully",
        data: result,
    });
});

// ৪. ইভেন্ট আপডেট করা (ইমেজসহ)
const updateEvent = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user as IRequestUser;

    // যদি নতুন ইমেজ আপলোড করা হয়
    if (req.file) {
        req.body.thumbnail = req.file.path;
    }

    // নাম্বার কনভার্সন (যদি বডিতে থাকে)
    if (req.body.totalSeats) req.body.totalSeats = Number(req.body.totalSeats);
    if (req.body.ticketPrice) req.body.ticketPrice = Number(req.body.ticketPrice);

    const result = await EventService.updateEventIntoDB(id, user.userId, req.body);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Event updated successfully",
        data: result,
    });
});

// ৫. ইভেন্ট ডিলেট করা (Soft Delete)
const deleteEvent = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user as IRequestUser;

    const result = await EventService.deleteEventFromDB(id, user.userId);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Event deleted successfully",
        data: result,
    });
});

export const EventController = {
    createEvent,
    getAllEvents,
    getSingleEvent,
    updateEvent,
    deleteEvent
};