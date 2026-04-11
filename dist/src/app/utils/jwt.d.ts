import jwt, { JwtPayload } from "jsonwebtoken";
export declare const jwtUtils: {
    createToken: (payload: JwtPayload, secret: string, expiresIn: string | number) => string;
    verifyToken: (token: string, secret: string) => jwt.JwtPayload | null;
    decodeToken: (token: string) => jwt.JwtPayload;
};
