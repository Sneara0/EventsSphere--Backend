/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload } from "jsonwebtoken";

// এখানে ৩য় আর্গুমেন্ট হিসেবে সরাসরি string বা number নেওয়া হচ্ছে
const createToken = (payload: JwtPayload, secret: string, expiresIn: string | number) => {
    const token = jwt.sign(payload, secret, { 
        expiresIn: expiresIn as any 
    });
    return token;
}

const verifyToken = (token: string, secret: string) => {
    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return decoded; // সরাসরি ডাটা রিটার্ন করা হচ্ছে সহজ করার জন্য
    } catch (error: any) {
        return null;
    }
}

const decodeToken = (token: string) => {
    const decoded = jwt.decode(token) as JwtPayload;
    return decoded;
}

export const jwtUtils = {
    createToken,
    verifyToken,
    decodeToken,
}