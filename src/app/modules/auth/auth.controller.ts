import { Request, Response } from "express";
import status from "http-status";
import { AuthService } from "./auth.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { cookieUtils } from "../../utils/cookie.js";
import { auth } from "../../lib/auth.js";
import AppError from "../../errorHelpers/AppError.js";
import bcrypt from "bcrypt";

import httpStatus from 'http-status';
import { prisma } from "../../lib/prisma.js";
import env from "../../../config/env.js";
// 1. User Registration (Fixed Enum Case Sensitivity)
const registerUser = catchAsync(async (req: Request, res: Response) => {
    // ইউজারের পাঠানো ডাটা থেকে রোলটিকে বড় হাতের অক্ষরে রূপান্তর করা হচ্ছে
    // কারণ প্রিজমা Enum (ORGANIZER, PARTICIPANT) বড় হাতের অক্ষর আশা করে
    const registrationData = {
        ...req.body,
        role: req.body.role ? req.body.role.toUpperCase() : "PARTICIPANT"
    };

    const result = await AuthService.registerUser(registrationData);
    const { accessToken, refreshToken, user } = result;

    // --- Better Auth OTP Trigger ---
    // রেজিস্ট্রেশন সফল হওয়ার পর অটোমেটিক ওটিপি পাঠানো হচ্ছে
    await auth.api.sendVerificationOTP({
        body: {
            email: user.email,
            type: "email-verification",
        },
    });

    cookieUtils.setAccessTokenCookie(res, accessToken);
    cookieUtils.setRefreshTokenCookie(res, refreshToken);

    sendResponse(res, {
        statusCode: status.CREATED, 
        success: true,
        message: "User registered successfully! Please check your email for OTP. 📩",
        data: {
            user: user,
            accessToken
        },
    });
});

// 2. Login User
const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.loginUser(req.body);
    const { accessToken, refreshToken } = result;

    cookieUtils.setAccessTokenCookie(res, accessToken);
    cookieUtils.setRefreshTokenCookie(res, refreshToken);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Logged in successfully!",
        data: {
            user: result.user,
            accessToken
        },
    });
});

// 3. Get Current User (Me)
const getMe = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;
    const result = await AuthService.getMe(user);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "User profile retrieved successfully!",
        data: result,
    });
});

// 4. Refresh Token
const getNewToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const sessionToken = req.headers.authorization?.split(" ")[1] || req.cookies.sessionToken;

    if (!refreshToken) throw new AppError(status.UNAUTHORIZED, "Refresh token is missing!");

    const result = await AuthService.getNewToken(refreshToken, sessionToken);
    
    cookieUtils.setAccessTokenCookie(res, result.accessToken);
    cookieUtils.setRefreshTokenCookie(res, result.refreshToken);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Access token regenerated successfully!",
        data: {
            accessToken: result.accessToken
        },
    });
});

// 5. Change Password
const changePassword = catchAsync(async (req: Request, res: Response) => {
    const sessionToken = req.headers.authorization?.split(" ")[1];
    if (!sessionToken) throw new AppError(status.UNAUTHORIZED, "Session token is required!");

    const result = await AuthService.changePassword(req.body, sessionToken);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Password changed successfully!",
        data: result,
    });
});

// 6. Logout User
const logoutUser = catchAsync(async (req: Request, res: Response) => {
    const sessionToken = req.headers.authorization?.split(" ")[1] || req.cookies.sessionToken;
    
    await AuthService.logoutUser(sessionToken as string);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Logged out successfully!",
        data: null,
    });
});

// 7. Verify Email (OTP Verification)
const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    
    const result = await auth.api.verifyEmailOTP({
        body: {
            email,
            otp,
        }
    });

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Email verified successfully! ✅",
        data: result,
    });
});

// 8. Forget Password
// 8. Forget Password (Fixed Type)
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase();
    
    // Better Auth এ resetPassword এর জন্য ওটিপি টাইপ "email-verification" রাখা নিরাপদ
    await auth.api.sendVerificationOTP({
        body: {
            email: normalizedEmail,
            type: "email-verification", 
        }
    });

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Password reset OTP sent to your email! 📧",
        data: null,
    });
});

// 9. Reset Password (Fixed Data Mapping)
// 9. Reset Password (Better Auth Standard Flow)
// auth.controller.ts

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();
    
    // ডাটাবেসে যেভাবে identifier সেভ হয়েছে সেই ফরম্যাটে রূপান্তর করুন
    const dbIdentifier = `email-verification-otp-${normalizedEmail}`;
    const submittedOtp = String(otp).trim();

    // ১. এখন সঠিক identifier দিয়ে খুঁজুন
    const verificationData = await prisma.verification.findFirst({
        where: {
            identifier: dbIdentifier, // এখন এটি ডাটাবেসের সাথে মিলবে
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    if (!verificationData) {
        console.log(`❌ ওটিপি পাওয়া যায়নি! খুঁজছিলাম: ${dbIdentifier}`);
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP code! ❌");
    }

    // ২. ওটিপি ভ্যালু চেক (আপনার ইমেজে দেখা যাচ্ছে ভ্যালুর শেষে ':0' আছে)
    // যদি আপনার ডাটাবেসে ভ্যালু '681971:0' থাকে, তবে সেভাবে মিলাতে হবে
    const dbValue = verificationData.value; // উদা: '681971:0'

    if (dbValue !== submittedOtp && dbValue !== `${submittedOtp}:0`) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP code! ❌");
    }

    // ৩. পাসওয়ার্ড আপডেট এবং ওটিপি ডিলিট
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await prisma.$transaction([
        prisma.user.update({
            where: { email: normalizedEmail },
            data: { password: hashedPassword }
        }),
        prisma.verification.deleteMany({
            where: { identifier: dbIdentifier }
        })
    ]);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password reset successfully! 🔐",
    });
});
// 10. Google Login
const googleLogin = catchAsync(async (req: Request, res: Response) => {
    const result = await auth.api.signInSocial({
        body: {
            provider: "google",
            callbackURL: `${env.FRONTEND_URL}/google/success`,
        }
    });

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Google login URL generated!",
        data: result,
    });
});

// 11. Google Login Success
const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
    const session = await auth.api.getSession({
        headers: new Headers(req.headers as Record<string, string>)
    });

    if (!session) {
        throw new AppError(status.UNAUTHORIZED, "Google session not found!");
    }

    const result = await AuthService.googleLoginSuccess(session);
    
    cookieUtils.setAccessTokenCookie(res, result.accessToken);
    cookieUtils.setRefreshTokenCookie(res, result.refreshToken);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Google login successful and profile synced!",
        data: {
            user: session.user,
            accessToken: result.accessToken
        },
    });
});

// 12. Handle OAuth Error
const handleOAuthError = catchAsync(async (req: Request, res: Response) => {
    const error = req.query.error || "OAuth authentication failed";
    
    sendResponse(res, {
        statusCode: status.BAD_REQUEST,
        success: false,
        message: error as string,
        data: null,
    });
});

export const AuthController = {
    registerUser,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    googleLogin,
    googleLoginSuccess,
    handleOAuthError
};