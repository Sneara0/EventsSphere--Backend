import status from "http-status";
import { UserStatus, Role } from "../../../generated/prisma/enums.js";
import AppError from "../../errorHelpers/AppError.js";
import { auth } from "../../lib/auth.js";
import { prisma } from "../../lib/prisma.js";
import { jwtUtils } from "../../utils/jwt.js";
import { tokenUtils } from "../../utils/token.js";
import env from "../../../config/env.js"; // পাথটি চেক করে নিন
/**
 * 1. Register User
 * প্রোফাইল এখন auth.ts এর databaseHooks এর মাধ্যমে অটোমেটিক তৈরি হবে।
 */
const registerUser = async (payload) => {
    const { name, email, password, role } = payload;
    // Better-Auth API call
    // এটি ইন্টারনালি ইউজার তৈরি করবে এবং আমাদের সেট করা Hook প্রোফাইল তৈরি করে দিবে।
    const data = await auth.api.signUpEmail({
        body: { name, email, password, role }
    });
    if (!data || !data.user) {
        throw new AppError(status.BAD_REQUEST, "Failed to register user in auth system");
    }
    const tokenPayload = {
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    };
    return {
        ...data,
        accessToken: tokenUtils.getAccessToken(tokenPayload),
        refreshToken: tokenUtils.getRefreshToken(tokenPayload),
    };
};
/**
 * 2. Login User
 */
const loginUser = async (payload) => {
    const { email, password } = payload;
    const data = await auth.api.signInEmail({
        body: { email, password }
    });
    if (!data || !data.user) {
        throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
    }
    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN, "User is blocked");
    }
    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }
    const tokenPayload = {
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    };
    return {
        ...data,
        accessToken: tokenUtils.getAccessToken(tokenPayload),
        refreshToken: tokenUtils.getRefreshToken(tokenPayload),
    };
};
/**
 * 3. Get Current User (Me)
 */
const getMe = async (user) => {
    const result = await prisma.user.findUnique({
        where: { id: user.userId },
        include: {
            participant: true,
            organizer: true,
            admin: true,
        }
    });
    if (!result)
        throw new AppError(status.NOT_FOUND, "User not found");
    return result;
};
/**
 * 4. Refresh Token Logic
 */
const getNewToken = async (refreshToken, sessionToken) => {
    const isSessionExists = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: { user: true }
    });
    if (!isSessionExists)
        throw new AppError(status.UNAUTHORIZED, "Invalid session");
    const verified = jwtUtils.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET);
    if (!verified)
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
    const tokenPayload = {
        userId: verified.userId,
        role: verified.role,
        name: verified.name,
        email: verified.email,
        status: verified.status,
        isDeleted: verified.isDeleted,
        emailVerified: verified.emailVerified,
    };
    const updatedSession = await prisma.session.update({
        where: { token: sessionToken },
        data: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    });
    return {
        accessToken: tokenUtils.getAccessToken(tokenPayload),
        refreshToken: tokenUtils.getRefreshToken(tokenPayload),
        sessionToken: updatedSession.token
    };
};
/**
 * 5. Google Login Success Logic
 * প্রোফাইল ক্রিয়েশন এখন এখানেও লাগবে না, কারণ Hook সব হ্যান্ডেল করবে।
 */
const googleLoginSuccess = async (session) => {
    if (!session || !session.user) {
        throw new AppError(status.UNAUTHORIZED, "Invalid Google Session");
    }
    const tokenPayload = {
        userId: session.user.id,
        role: session.user.role || Role.PARTICIPANT,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status || UserStatus.ACTIVE,
        isDeleted: session.user.isDeleted || false,
        emailVerified: session.user.emailVerified,
    };
    return {
        accessToken: tokenUtils.getAccessToken(tokenPayload),
        refreshToken: tokenUtils.getRefreshToken(tokenPayload),
    };
};
/**
 * 6. Change Password
 */
const changePassword = async (payload, sessionToken) => {
    return await auth.api.changePassword({
        body: {
            currentPassword: payload.currentPassword,
            newPassword: payload.newPassword,
            revokeOtherSessions: true,
        },
        headers: new Headers({ Authorization: `Bearer ${sessionToken}` })
    });
};
/**
 * 7. Logout User
 */
const logoutUser = async (sessionToken) => {
    return await auth.api.signOut({
        headers: new Headers({ Authorization: `Bearer ${sessionToken}` })
    });
};
/**
 * 8. Forget Password
 */
const forgetPassword = async (email) => {
    // ১. ইউজার আছে কি না এবং ডিলিট করা কি না চেক করুন
    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found with this email!");
    }
    if (user.isDeleted) {
        throw new AppError(status.FORBIDDEN, "This account has been deleted!");
    }
    // ২. Better-Auth এর মাধ্যমে OTP রিকোয়েস্ট পাঠানো
    // এটি আপনার auth.ts-এ সেট করা ইমেইল সেন্ডারের মাধ্যমে OTP পাঠাবে
    return await auth.api.requestPasswordResetEmailOTP({
        body: { email }
    });
};
/**
 * 9. Reset Password
 */
const resetPassword = async (email, otp, newPassword) => {
    // ১. Better-Auth এর মাধ্যমে OTP ভেরিফাই এবং পাসওয়ার্ড আপডেট
    const result = await auth.api.resetPasswordEmailOTP({
        body: {
            email,
            otp,
            password: newPassword
        }
    });
    // ২. সেশন ক্লিনিং (Security Best Practice)
    // Better-Auth এর রেজাল্ট থেকে ইউজার আইডি চেক করা হচ্ছে
    const userResult = result;
    if (userResult?.user?.id) {
        // এই ইউজারের সব পুরনো সেশন ডাটাবেজ থেকে মুছে ফেলা হচ্ছে
        await prisma.session.deleteMany({
            where: {
                userId: userResult.user.id
            }
        });
    }
    return result;
};
/**
 * 10. Verify Email
 */
const verifyEmail = async (email, otp) => {
    const result = await auth.api.verifyEmailOTP({ body: { email, otp } });
    if (result) {
        await prisma.user.update({
            where: { email },
            data: { emailVerified: true }
        });
    }
    return result;
};
export const AuthService = {
    registerUser,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    googleLoginSuccess,
};
