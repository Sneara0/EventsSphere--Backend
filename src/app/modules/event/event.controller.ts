import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { EventService } from "./event.service";
import { IRequestUser } from "../../interfaces/requestUser.interface";


const createEvent = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;

    if (req.file) {
        req.body.thumbnail = req.file.path;
    }

    const payload = {
        ...req.body,
        totalSeats: Number(req.body.totalSeats),
        ticketPrice: Number(req.body.ticketPrice || 0),
    };

    const result = await EventService.createEventIntoDB(user.userId, payload);

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Event created successfully!",
        data: result,
    });
});


const getAllEvents = catchAsync(async (req: Request, res: Response) => {
    const filters = req.query;
    const result = await EventService.getAllEventsFromDB(filters as any);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Events fetched successfully",
        data: result,
    });
});


const getSingleEvent = catchAsync(async (req: Request, res: Response) => {
   
    const id = req.params.id as string; 
    const result = await EventService.getSingleEventFromDB(id);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Event details fetched successfully",
        data: result,
    });
});


const updateEvent = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string; 
    const user = req.user as IRequestUser;

    if (req.file) {
        req.body.thumbnail = req.file.path;
    }

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

/**
 * 5. Soft delete an event
 */
const deleteEvent = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;
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
    deleteEvent,
};