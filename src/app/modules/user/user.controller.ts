import { Request, Response } from "express";
import status from "http-status";
import { UserService } from "./user.service";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync"; // পাথ চেক করে নিন
import { sendResponse } from "../../utils/sendResponse"; // পাথ চেক করে নিন

// ১. সব ইউজার আনা
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

// ২. সিঙ্গেল ইউজার আনা (ID Fix)
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params; // ডিরেক্ট ডিস্ট্রাকচার করা ভালো
    const result = await UserService.getSingleUserFromDB(id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User fetched successfully",
        data: result,
    });
});

// ৩. নিজের প্রোফাইল দেখা
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    
    // সার্ভিসে userId এবং role পাঠানো হচ্ছে
    const result = await UserService.getMyProfileFromDB(user.userId, user.role as Role);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Profile fetched successfully",
        data: result,
    });
});

// ৪. প্রোফাইল আপডেট (লজিক্যাল ফিক্স)
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IRequestUser;
    
    // payload হিসেবে req.body পাঠানো হচ্ছে
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

export const UserController = {
    getAllUsers,
    getSingleUser,
    getMyProfile,
    updateMyProfile
};