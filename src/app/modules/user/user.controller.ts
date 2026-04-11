import { Request, Response } from "express";
import status from "http-status";
import { UserService } from "./user.service.js";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { Role } from "../../../generated/prisma/enums.js";
import { catchAsync } from "../../utils/catchAsync.js"; 
import { sendResponse } from "../../utils/sendResponse.js"; 

// ১. সব ইউজার আনা (এডমিনের জন্য)
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const role = req.query.role as Role;
    const result = await UserService.getAllUsersFromDB(role);
    
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Users fetched successfully",
        data: result,
    });
});

// ২. নির্দিষ্ট আইডি দিয়ে ইউজার আনা
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params; 
    const result = await UserService.getSingleUserFromDB(id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User fetched successfully",
        data: result,
    });
});

// ৩. নিজের প্রোফাইল দেখা (Me)
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    // Auth Middleware থেকে পাওয়া userId এবং role ব্যবহার করা হচ্ছে
    const result = await UserService.getMyProfileFromDB(user.userId, user.role as Role);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Profile fetched successfully",
        data: result,
    });
});

// ৪. নিজের প্রোফাইল আপডেট করা
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const result = await UserService.updateMyProfileIntoDB(
        user.userId, 
        user.role as Role, 
        req.body
    );

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});

// ৫. ইউজার ডিলিট করা (Soft Delete)
const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params; 
    
    // শুধু ID পাঠানো হচ্ছে, SQL $1 প্লেসহোল্ডারের জন্য এটিই যথেষ্ট
    const result = await UserService.deleteUserFromDB(id as string);

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