import status from "http-status";
export const handleZodError = (err) => {
    const statusCodes = status.BAD_REQUEST;
    const message = " zod validation error";
    const errorSources = [];
    err.issues.forEach(issue => {
        errorSources.push({
            path: issue.path.join(" "),
            message: issue.message
        });
    });
    return {
        success: false,
        message,
        errorSources,
        statusCodes
    };
};
