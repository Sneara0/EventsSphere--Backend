export const validateRequest = (ZodSchema) => {
    return (req, res, next) => {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        const parseResult = ZodSchema.safeParse(req.body);
        if (!parseResult.success) {
            next(parseResult.error);
        }
        //sanitizing data
        req.body = parseResult.data;
        next();
    };
};
