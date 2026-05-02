/**
 * ZodSchema এর টাইপ 'any' রাখা হয়েছে যাতে আপনার ভার্সন জনিত
 * 'AnyZodObject' বা 'ZodObject' এর টাইপ এররটি আর না আসে।
 */
export const validateRequest = (ZodSchema) => {
    return async (req, res, next) => {
        try {
            // ১. FormData বা ইমেজ আপলোডের সময় আসা 'data' ফিল্ড পার্স করা
            if (req.body && req.body.data && typeof req.body.data === 'string') {
                try {
                    req.body = JSON.parse(req.body.data);
                }
                catch (e) {
                    // JSON ইনভ্যালিড হলে কিছু করার দরকার নেই
                }
            }
            // ২. ভ্যালিডেশন (Body, Query, Params সব একসাথে)
            const parseResult = await ZodSchema.safeParseAsync({
                body: req.body || {},
                query: req.query,
                params: req.params,
                cookies: req.cookies,
            });
            // ৩. যদি ভ্যালিডেশন ফেইল করে, তবে এখানেই রিটার্ন করে দিন
            if (!parseResult.success) {
                return next(parseResult.error);
            }
            /**
             * ৪. Sanitizing Data:
             * Zod এর মাধ্যমে ভ্যালিড করা ডাটা পুনরায় বডিতে সেট করা।
             * মনে রাখবেন আপনার Zod Schema-তে অবশ্যই 'body' অবজেক্ট থাকতে হবে।
             */
            if (parseResult.data.body) {
                req.body = parseResult.data.body;
            }
            if (parseResult.data.query) {
                req.query = parseResult.data.query;
            }
            if (parseResult.data.params) {
                req.params = parseResult.data.params;
            }
            return next();
        }
        catch (error) {
            return next(error);
        }
    };
};
