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

// 1. User Registration (Ensuring UpperCase matches with Enum Schema)
const registerUser = catchAsync(async (req: Request, res: Response) => {
    const registrationData = {
        ...req.body,
        role: req.body.role ? req.body.role.toUpperCase() : "PARTICIPANT"
    };

    const result = await AuthService.registerUser(registrationData);
    const { accessToken, refreshToken, user } = result;

    // --- Better Auth OTP Trigger ---
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

// 2. Login User (Enforcing Strict Role Object Structure for Frontend Mapping)
const loginUser = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // ডাটাবেস থেকে ইউজারটি খুঁজে বের করা
    const userExists = await prisma.user.findUnique({
        where: { email: normalizedEmail }
    });

    if (!userExists) {
        throw new AppError(status.BAD_REQUEST, "Invalid email or password");
    }

    let result;

    // Better-Auth এর পাসওয়ার্ড হ্যাশ সাধারণত $scrypt$ বা b64 ফরম্যাটে থাকে, যা $2b$ (bcrypt) দিয়ে শুরু হয় না
    const isBetterAuthHash = userExists.password && !userExists.password.startsWith("$2b$");

    if (isBetterAuthHash) {
        // ডাইনামিকালি Better-Auth ক্রিপ্টো ভেরিফায়ার ইম্পোর্ট করা
        const { verifyPassword } = await import("better-auth/crypto");
        
        const isPasswordMatch = await verifyPassword({
            hash: userExists.password as string,
            password: password
        });

        if (!isPasswordMatch) {
            throw new AppError(status.BAD_REQUEST, "Invalid email or password");
        }

        // ডেমো বাইপাস ফ্ল্যাগ দিয়ে কাস্টম AuthService রান করা হচ্ছে
        const serviceResult = await AuthService.loginUser({ 
            email: normalizedEmail, 
            password, 
            isDemoBypass: true 
        } as any);

        // ডেটাবেসের এক্সাক্ট রোল প্রপার্টি ফ্রন্টএন্ডে পাস করা নিশ্চিত করা হচ্ছে
        result = {
            accessToken: serviceResult.accessToken,
            refreshToken: serviceResult.refreshToken,
            user: serviceResult.user || {
                id: userExists.id,
                name: userExists.name,
                email: userExists.email,
                role: userExists.role // 👈 আপনার Enum Role (যেমন: ADMIN, USER, PARTICIPANT ইত্যাদি)
            }
        };
    } else {
        // নরমাল ইউজার বা সরাসরি Bcrypt দিয়ে তৈরি অ্যাকাউন্টের জন্য স্ট্যান্ডার্ড সার্ভিস কল
        result = await AuthService.loginUser(req.body);
    }

    const { accessToken, refreshToken } = result;

    cookieUtils.setAccessTokenCookie(res, accessToken);
    cookieUtils.setRefreshTokenCookie(res, refreshToken);

    // রেসপন্স অবজেক্টের স্ট্রাকচার ফিক্সড করা হলো যেন ড্যাশবোর্ড সহজেই রিডাইরেক্ট হতে পারে
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
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase();
    
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
const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();
    const dbIdentifier = `email-verification-otp-${normalizedEmail}`;
    const submittedOtp = String(otp).trim();

    const verificationData = await prisma.verification.findFirst({
        where: {
            identifier: dbIdentifier,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    if (!verificationData) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP code! ❌");
    }

    const dbValue = verificationData.value;

    if (dbValue !== submittedOtp && dbValue !== `${submittedOtp}:0`) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid OTP code! ❌");
    }

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