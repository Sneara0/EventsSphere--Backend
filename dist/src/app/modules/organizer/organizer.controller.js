import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { OrganizerService } from "./organizer.service";
/**
 * ১. প্রোফাইল তৈরি করা
 */
const createProfile = catchAsync(async (req, res) => {
    const user = req.user;
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
const getMyProfile = catchAsync(async (req, res) => {
    const user = req.user;
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
const updateMyProfile = catchAsync(async (req, res) => {
    const user = req.user;
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
const getAllOrganizers = catchAsync(async (req, res) => {
    // req.query কে 'any' কাস্ট করে দিলে ফিল্টার এরর চলে যাবে
    const result = await OrganizerService.getAllOrganizersFromDB(req.query);
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
const getSingleOrganizer = catchAsync(async (req, res) => {
    const { id } = req.params;
    // ✅ 'id as string' যোগ করা হয়েছে কারণ req.params থেকে এটি string | string[] হতে পারে
    const result = await OrganizerService.getSingleOrganizerFromDB(id);
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
