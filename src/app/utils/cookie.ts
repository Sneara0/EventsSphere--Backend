import { Request, Response } from "express";
import ms from "ms";

/**
 * .env থেকে আসা স্ট্রিংকে মিলি-সেকেন্ডে রূপান্তর করে এবং নিশ্চিত করে সেটি একটি Number।
 */
const getMaxAge = (envValue: string | undefined, defaultValue: string): number => {
    try {
        const timeValue = envValue || defaultValue;
        const milliseconds = ms(timeValue as any);
        return Number(milliseconds); 
    } catch (error) {
        return Number(ms(defaultValue as any));
    }
};

const setCookie = (res: Response, key: string, value: string, options: any) => {
    res.cookie(key, value, options);
};

// --- ফিক্সড এক্সেস টোকেন কুকি ---
const setAccessTokenCookie = (res: Response, token: string) => {
    // ১ ঘণ্টা (1h) থেকে বাড়িয়ে ১ দিন (1d) করা হয়েছে যাতে কাজ করতে সুবিধা হয়
    const maxAge = getMaxAge(process.env.ACCESS_TOKEN_EXPIRES_IN, '1d');

    setCookie(res, "accessToken", token, {
        httpOnly: true,
        // প্রোডাকশনে HTTPS থাকলে 'secure: true' হবে, লোকালহোস্টে 'false'
        secure: process.env.NODE_ENV === "production",
        // লোকালহোস্টে 'lax' ব্যবহার করলে কুকি ব্লক হবে না
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: maxAge
    });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
    const maxAge = getMaxAge(process.env.REFRESH_TOKEN_EXPIRES_IN, '7d');

    setCookie(res, "refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: maxAge
    });
};

const setBetterAuthSessionCookie = (res: Response, sessionId: string) => {
    const maxAge = getMaxAge(process.env.REFRESH_TOKEN_EXPIRES_IN, '7d');

    setCookie(res, "betterAuthSession", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: maxAge
    });
};

export const cookieUtils = {
    setCookie,
    getCookie: (req: Request, key: string) => req.cookies[key],
    clearCookie: (res: Response, key: string, options: any) => res.clearCookie(key, options),
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthSessionCookie
};