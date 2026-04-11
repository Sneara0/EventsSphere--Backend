import httpStatus from "http-status";
import { ZodError } from "zod";
import AppError from "../errorHelpers/AppError";
const globalErrorHandler = (err, req, res, next) => {
    console.error("🔥 Global Error Log:", err);
    // টাইপটি স্পষ্টভাবে number করে দেওয়া হলো
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    let message = "Something went wrong!";
    let errorMessages = [];
    if (err instanceof ZodError) {
        statusCode = httpStatus.BAD_REQUEST;
        message = "Validation Error";
        errorMessages = err.issues.map((issue) => ({
            path: issue.path[issue.path.length - 1],
            message: issue.message,
        }));
    }
    else if (err?.name === 'PrismaClientKnownRequestError') {
        statusCode = httpStatus.BAD_REQUEST;
        message = "Database Error";
        errorMessages = [{ path: "", message: err.message || "A database constraint failed." }];
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        errorMessages = [{ path: "", message: err.message }];
    }
    else if (err instanceof Error) {
        message = err.message;
        errorMessages = [{ path: "", message: err.message }];
    }
    return res.status(statusCode).json({
        success: false,
        message,
        errorMessages,
        stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
    });
};
export default globalErrorHandler;
