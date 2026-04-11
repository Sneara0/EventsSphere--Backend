import { Request, Response } from "express";
export declare const cookieUtils: {
    setCookie: (res: Response, key: string, value: string, options: any) => void;
    getCookie: (req: Request, key: string) => any;
    clearCookie: (res: Response, key: string, options: any) => Response<any, Record<string, any>>;
    setAccessTokenCookie: (res: Response, token: string) => void;
    setRefreshTokenCookie: (res: Response, token: string) => void;
    setBetterAuthSessionCookie: (res: Response, sessionId: string) => void;
};
