import { Response } from "express";
export declare const tokenUtils: {
    getAccessToken: (payload: any) => string;
    getRefreshToken: (payload: any) => string;
    setAccessTokenCookie: (res: Response, token: string) => void;
    setRefreshTokenCookie: (res: Response, token: string) => void;
};
