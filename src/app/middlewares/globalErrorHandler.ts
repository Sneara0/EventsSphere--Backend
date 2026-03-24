import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import AppError from "../errorHelpers/AppError";
// নিশ্চিত করো তোমার config ফাইল এভাবেই ইমপোর্ট হচ্ছে

const globalErrorHandler: ErrorRequestHandler = (
    err,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    let message = "Something went wrong!";
    let errorMessages: { path: string | number; message: string }[] = [];

    // ১. Zod Validation Error হ্যান্ডল করা
    if (err instanceof ZodError) {
        statusCode = httpStatus.BAD_REQUEST;
        message = "Validation Error";
        
        // 'as string' যোগ করা হয়েছে যাতে PropertyKey (symbol) এরর না দেয়
        errorMessages = err.issues.map((issue) => ({
            path: issue.path[issue.path.length - 1] as string | number,
            message: issue.message,
        }));
    } 
    // ২. কাস্টম AppError হ্যান্ডল করা
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        errorMessages = [
            {
                path: "",
                message: err.message,
            },
        ];
    } 
    // ৩. সাধারণ Error হ্যান্ডল করা
    else if (err instanceof Error) {
        message = err.message;
        errorMessages = [
            {
                path: "",
                message: err.message,
            },
        ];
    }

    // ফাইনাল রেসপন্স পাঠানো
    return res.status(statusCode).json({
        success: false,
        message,
        errorMessages,
        // config.env ব্যবহার করা হয়েছে তোমার env.ts ফাইল অনুযায়ী
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
    });
};

export default globalErrorHandler;