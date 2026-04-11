import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { OrganizerService } from "./organizer.service.js";

/**
 * ১. প্রোফাইল তৈরি করা
 */
const createProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const result = await OrganizerService.createProfileIntoDB(user.userId, req.body);

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Organizer profile created successfully!",
        data: result,
    });
});

/**
 * ২. অর্গানাইজারের নিজের প্রোফাইল দেখা
 */
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const result = await OrganizerService.getMyProfileFromDB(user.userId);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Organizer profile fetched successfully!",
        data: result,
    });
});

/**
 * ৩. অর্গানাইজারের প্রোফাইল আপডেট করা
 */
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const payload = req.body;

    const result = await OrganizerService.updateMyProfileIntoDB(user.userId, payload);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Organizer profile updated successfully!",
        data: result,
    });
});

/**
 * ৪. সব অর্গানাইজার দেখা
 */
const getAllOrganizers = catchAsync(async (req: Request, res: Response) => {
    // req.query কে 'any' কাস্ট করে দিলে ফিল্টার এরর চলে যাবে
    const result = await OrganizerService.getAllOrganizersFromDB(req.query as any);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Organizers fetched successfully!",
        data: result,
    });
});

/**
 * ৫. আইডি দিয়ে নির্দিষ্ট অর্গানাইজার দেখা (Fixes Error 2345)
 */
const getSingleOrganizer = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // ✅ 'id as string' যোগ করা হয়েছে কারণ req.params থেকে এটি string | string[] হতে পারে
    const result = await OrganizerService.getSingleOrganizerFromDB(id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Organizer details fetched successfully!",
        data: result,
    });
});

export const OrganizerController = {
    createProfile,
    getMyProfile,
    updateMyProfile,
    getAllOrganizers,
    getSingleOrganizer,
};