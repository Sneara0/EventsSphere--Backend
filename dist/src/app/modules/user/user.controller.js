import status from "http-status";
import { UserService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
// ১. সব ইউজার আনা (এডমিনের জন্য)
const getAllUsers = catchAsync(async (req, res) => {
    const role = req.query.role;
    const result = await UserService.getAllUsersFromDB(role);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Users fetched successfully",
        data: result,
    });
});
// ২. নির্দিষ্ট আইডি দিয়ে ইউজার আনা
const getSingleUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UserService.getSingleUserFromDB(id);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User fetched successfully",
        data: result,
    });
});
// ৩. নিজের প্রোফাইল দেখা (Me)
const getMyProfile = catchAsync(async (req, res) => {
    const user = req.user;
    // Auth Middleware থেকে পাওয়া userId এবং role ব্যবহার করা হচ্ছে
    const result = await UserService.getMyProfileFromDB(user.userId, user.role);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Profile fetched successfully",
        data: result,
    });
});
// ৪. নিজের প্রোফাইল আপডেট করা
const updateMyProfile = catchAsync(async (req, res) => {
    const user = req.user;
    const result = await UserService.updateMyProfileIntoDB(user.userId, user.role, req.body);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});
// ৫. ইউজার ডিলিট করা (Soft Delete)
const deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    // শুধু ID পাঠানো হচ্ছে, SQL $1 প্লেসহোল্ডারের জন্য এটিই যথেষ্ট
    const result = await UserService.deleteUserFromDB(id);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User deleted successfully",
        data: result,
    });
});
export const UserController = {
    getAllUsers,
    getSingleUser,
    getMyProfile,
    updateMyProfile,
    deleteUser
};
