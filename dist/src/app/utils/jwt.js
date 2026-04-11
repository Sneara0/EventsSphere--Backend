/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";
// এখানে ৩য় আর্গুমেন্ট হিসেবে সরাসরি string বা number নেওয়া হচ্ছে
const createToken = (payload, secret, expiresIn) => {
    const token = jwt.sign(payload, secret, {
        expiresIn: expiresIn
    });
    return token;
};
const verifyToken = (token, secret) => {
    try {
        const decoded = jwt.verify(token, secret);
        return decoded; // সরাসরি ডাটা রিটার্ন করা হচ্ছে সহজ করার জন্য
    }
    catch (error) {
        return null;
    }
};
const decodeToken = (token) => {
    const decoded = jwt.decode(token);
    return decoded;
};
export const jwtUtils = {
    createToken,
    verifyToken,
    decodeToken,
};
