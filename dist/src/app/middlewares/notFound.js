import httpStatus from "http-status";
const notFound = (req, res, next) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "API Not Found!",
        errorMessages: [
            {
                path: req.originalUrl,
                message: "The requested URL was not found on this server.",
            },
        ],
    });
};
export default notFound;
