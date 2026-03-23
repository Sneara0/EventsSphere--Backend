import { Response } from "express";
import { jwtUtils } from "./jwt";

const getAccessToken = (payload: any) => {
    return jwtUtils.createToken(
        payload,
        process.env.ACCESS_TOKEN_SECRET as string,
        process.env.ACCESS_TOKEN_EXPIRES_IN || "1h"
    );
};

const getRefreshToken = (payload: any) => {
    return jwtUtils.createToken(
        payload,
        process.env.REFRESH_TOKEN_SECRET as string,
        process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"
    );
};


const setAccessTokenCookie = (res: Response, token: string) => {
    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1 * 60 * 60 * 1000, 
    });
};

const setRefreshTokenCookie = (res: Response, token: string) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie, 
    setRefreshTokenCookie,
};