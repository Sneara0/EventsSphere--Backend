import { Request, Response } from "express";
import status from "http-status";
import { UserService } from "./user.service";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "src/app/utils/catchAsync";
import { sendResponse } from "src/app/utils/sendResponse";

// সব ইউজার আনা
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

// ✅ গেট সিঙ্গেল ইউজার (TypeError Fix)
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    // এখানে 'as string' যোগ করা হয়েছে যাতে string | string[] এরর না আসে
    const id = req.params.id as string; 
    
    const result = await UserService.getSingleUserFromDB(id);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User fetched successfully",
        data: result,
    });
});

// প্রোফাইল দেখা
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const result = await UserService.getMyProfileFromDB(user.userId, user.role as Role);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Profile fetched successfully",
        data: result,
    });
});

// প্রোফাইল আপডেট
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    const result = await UserService.updateMyProfileIntoDB(user.userId, user.role as Role, req.body);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
});

export const UserController = {
    getAllUsers,
    getSingleUser, // এটি এখন এক্সপোর্ট হচ্ছে
    getMyProfile,
    updateMyProfile
};