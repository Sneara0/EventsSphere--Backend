import { Response } from "express";
import { jwtUtils } from "./jwt";
import ms from "ms";

/**
 * ১. এক্সেস টোকেন জেনারেট করা
 * পেলোডটি সরাসরি অবজেক্ট হিসেবে পাস করা হচ্ছে যাতে ডিকোড করার সময় ডাটা পাওয়া সহজ হয়।
 */
const getAccessToken = (payload: any) => {
    return jwtUtils.createToken(
        { ...payload }, 
        process.env.ACCESS_TOKEN_SECRET as string,
        process.env.ACCESS_TOKEN_EXPIRES_IN || "1d" // ১ দিন দেওয়া হলো যাতে বারবার সেশন আউট না হয়
    );
};

/**
 * ২. রিফ্রেশ টোকেন জেনারেট করা
 */
const getRefreshToken = (payload: any) => {
    return jwtUtils.createToken(
        { ...payload },
        process.env.REFRESH_TOKEN_SECRET as string,
        process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"
    );
};

/**
 * ৩. এক্সেস টোকেন কুকি সেট করা
 * এখানে sameSite এবং secure সেটিংস লোকালহোস্ট ও প্রোডাকশনের জন্য ডাইনামিক করা হয়েছে।
 */
const setAccessTokenCookie = (res: Response, token: string) => {
    const isProduction = process.env.NODE_ENV === "production";
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || "1d";
    
    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: isProduction,
        // লোকালহোস্টে lax ব্যবহার করলে কুকি ব্লক হবে না
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: Number(ms(expiresIn as any)), 
    });
};

/**
 * ৪. রিফ্রেশ টোকেন কুকি সেট করা
 */
const setRefreshTokenCookie = (res: Response, token: string) => {
    const isProduction = process.env.NODE_ENV === "production";
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: Number(ms(expiresIn as any)),
    });
};

export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie, 
    setRefreshTokenCookie,
};