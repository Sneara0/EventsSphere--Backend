import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import status from "http-status";
import { EventService } from "./event.service.js";
/**
 * ১. ড্যাশবোর্ড স্ট্যাটস (Admin Only)
 */
const getEventStats = catchAsync(async (req, res) => {
    const result = await EventService.getEventStatsFromDB();
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Dashboard statistics fetched successfully! 📊",
        data: result,
    });
});
/**
 * ২. এআই সার্চ সাজেশন
 */
const getAISuggestions = catchAsync(async (req, res) => {
    const { searchTerm } = req.query;
    // searchTerm না থাকলে আমরা ফাঁকা অ্যারে পাঠাবো
    const result = await EventService.getAISuggestionsFromDB(searchTerm || "");
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "AI suggestions fetched successfully! ✨",
        data: result,
    });
});
/**
 * ৩. নতুন ইভেন্ট তৈরি করা
 */
const createEvent = catchAsync(async (req, res) => {
    const user = req.user;
    const payload = req.body.body ? { ...req.body.body } : { ...req.body };
    if (req.file) {
        payload.thumbnail = req.file.path;
    }
    // ডাটা কনভার্সন
    if (payload.totalSeats)
        payload.totalSeats = Number(payload.totalSeats);
    if (payload.ticketPrice)
        payload.ticketPrice = Number(payload.ticketPrice);
    if (payload.isRefundable !== undefined) {
        payload.isRefundable = payload.isRefundable === 'true' || payload.isRefundable === 'on' || payload.isRefundable === true;
    }
    const result = await EventService.createEventIntoDB(user.userId, payload);
    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Event offer launched successfully! ✈️",
        data: result,
    });
});
/**
 * ৪. সার্চ এবং ফিল্টারসহ সব ইভেন্ট পাওয়া
 */
const getAllEvents = catchAsync(async (req, res) => {
    const result = await EventService.getAllEventsFromDB(req.query);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Event offers fetched successfully",
        data: result,
    });
});
/**
 * ৫. সিঙ্গেন্ট ইভেন্ট ডিটেইলস
 */
const getSingleEvent = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await EventService.getSingleEventFromDB(id);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Event details fetched successfully",
        data: result,
    });
});
/**
 * ৬. ইভেন্ট আপডেট করা
 */
const updateEvent = catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const updateData = req.body.body ? { ...req.body.body } : { ...req.body };
    if (req.file)
        updateData.thumbnail = req.file.path;
    if (updateData.totalSeats)
        updateData.totalSeats = Number(updateData.totalSeats);
    if (updateData.ticketPrice !== undefined)
        updateData.ticketPrice = Number(updateData.ticketPrice);
    if (updateData.isRefundable !== undefined) {
        updateData.isRefundable = updateData.isRefundable === 'true' || updateData.isRefundable === 'on' || updateData.isRefundable === true;
    }
    const result = await EventService.updateEventIntoDB(id, user.userId, updateData);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Event offer updated successfully",
        data: result,
    });
});
/**
 * ৭. ইভেন্ট ডিলিট করা
 */
const deleteEvent = catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const result = await EventService.deleteEventFromDB(id, user.userId);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Event offer deleted successfully",
        data: result,
    });
});
export const EventController = {
    createEvent,
    getAllEvents,
    getSingleEvent,
    updateEvent,
    deleteEvent,
    getEventStats, // New
    getAISuggestions, // New
};
