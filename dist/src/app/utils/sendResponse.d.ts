import { Response } from "express";
interface IResponseData<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data?: T;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare const sendResponse: <T>(res: Response, responseData: IResponseData<T>) => void;
export {};
