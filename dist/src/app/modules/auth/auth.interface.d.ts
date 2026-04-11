import { Role, UserStatus } from "../../../generated/prisma/enums.js";
/**
 * ১. Registration Payload (User)
 */
export interface IRegisterUserPayload {
    name: string;
    email: string;
    password: string;
    role: Role;
    contactNumber?: string;
}
/**
 * ২. Login Payload
 */
export interface ILoginUserPayload {
    email: string;
    password: string;
}
/**
 * ৩. Change Password Payload
 */
export interface IChangePasswordPayload {
    currentPassword?: string;
    newPassword: string;
}
/**
 * ৪. JWT Token Payload
 * tokenUtils এবং jwtUtils এ এটি ব্যবহার করা হবে
 */
export interface ITokenPayload {
    userId: string;
    role: Role;
    name: string;
    email: string;
    status?: UserStatus;
    isDeleted?: boolean;
    emailVerified?: boolean;
}
/**
 * ৫. Auth Response (Login/Register এর জন্য)
 */
export interface IAuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: Role;
        status: UserStatus;
        image?: string | null;
    };
    accessToken: string;
    refreshToken: string;
    sessionToken?: string;
    patient?: any;
}
/**
 * ৬. Refresh Token Response
 */
export interface IRefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    sessionToken: string;
}
