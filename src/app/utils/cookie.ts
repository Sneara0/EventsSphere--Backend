import { CookieOptions } from "better-auth";
import { Request, Response } from "express";
import ms from "ms";

/**
 * .env থেকে আসা স্ট্রিংকে মিলি-সেকেন্ডে রূপান্তর করে এবং নিশ্চিত করে সেটি একটি Number।
 */
const getMaxAge = (envValue: string | undefined, defaultValue: string): number => {
    try {
        const timeValue = envValue || defaultValue;
        const milliseconds = ms(timeValue as any);
        return Number(milliseconds); // নিশ্চিতভাবে Number রিটার্ন করবে
    } catch (error) {
        return Number(ms(defaultValue as any));
    }
};

const setCookie = (res: Response, key: string, value: string, options: any) => {
    res.cookie(key, value, options);
};

const getCookie = (req: Request, key: string) => {
    return req.cookies[key];
};

const clearCookie = (res: Response, key: string, options: any) => {
    res.clearCookie(key, options);
};

const setAccessTokenCookie = (res: Response, token: string) => {
    const maxAge = getMaxAge(process.env.ACCESS_TOKEN_EXPIRES_IN, '1h');

    setCookie(res, "accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: maxAge // এখন এটি নিশ্চিতভাবে একটি number
    });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
    const maxAge = getMaxAge(process.env.REFRESH_TOKEN_EXPIRES_IN, '7d');

    setCookie(res, "refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: maxAge
    });
};

const setBetterAuthSessionCookie = (res: Response, sessionId: string) => {
    const maxAge = getMaxAge(process.env.REFRESH_TOKEN_EXPIRES_IN, '7d');

    setCookie(res, "betterAuthSession", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: maxAge
    });
};

export const cookieUtils = {
    setCookie,
    getCookie,
    clearCookie,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthSessionCookie
};