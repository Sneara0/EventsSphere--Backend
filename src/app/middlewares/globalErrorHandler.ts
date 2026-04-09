import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import AppError from "../errorHelpers/AppError";

const globalErrorHandler: ErrorRequestHandler = (
    err,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // টার্মিনালে এররটি দেখার জন্য (ডিবাগিং এর জন্য এটি সবচেয়ে গুরুত্বপূর্ণ)
    console.error("🔥 Global Error Log:", err);

    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    let message = "Something went wrong!";
    let errorMessages: { path: string | number; message: string }[] = [];

    // ১. Zod Validation Error
    if (err instanceof ZodError) {
        statusCode = httpStatus.BAD_REQUEST;
        message = "Validation Error";
        errorMessages = err.issues.map((issue) => ({
            path: issue.path[issue.path.length - 1] as string | number,
            message: issue.message,
        }));
    } 
    // ২. Prisma Client Known Request Error (যেমন: Foreign Key বা Unique Constraint)
    else if (err?.name === 'PrismaClientKnownRequestError') {
        statusCode = httpStatus.BAD_REQUEST;
        message = "Database Error";
        errorMessages = [
            {
                path: "",
                message: err.message || "A database constraint failed.",
            },
        ];
    }
    // ৩. কাস্টম AppError
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
    // ৪. সাধারণ Error
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
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
    });
};

export default globalErrorHandler;