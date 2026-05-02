import { UserStatus, Role } from "../../../generated/prisma/enums.js";
import { IRequestUser } from "../../interfaces/requestUser.interface.js";
import { IChangePasswordPayload, ILoginUserPayload, IRegisterUserPayload } from "./auth.interface.js";
export declare const AuthService: {
    registerUser: (payload: IRegisterUserPayload) => Promise<{
        accessToken: string;
        refreshToken: string;
        token: null;
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            emailVerified: boolean;
            name: string;
            image?: string | null | undefined | undefined;
            role: string;
            status: string;
            needPasswordChange: boolean;
            isDeleted: boolean;
        };
    } | {
        accessToken: string;
        refreshToken: string;
        token: string;
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            emailVerified: boolean;
            name: string;
            image?: string | null | undefined | undefined;
            role: string;
            status: string;
            needPasswordChange: boolean;
            isDeleted: boolean;
        };
    }>;
    loginUser: (payload: ILoginUserPayload) => Promise<{
        accessToken: string;
        refreshToken: string;
        redirect: boolean;
        token: string;
        url?: string | undefined;
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            emailVerified: boolean;
            name: string;
            image?: string | null | undefined | undefined;
            role: string;
            status: string;
            needPasswordChange: boolean;
            isDeleted: boolean;
        };
    }>;
    getMe: (user: IRequestUser) => Promise<{
        participant: {
            name: string;
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            profileImage: string | null;
            contactNumber: string | null;
            address: string | null;
            interests: string[];
        } | null;
        organizer: {
            name: string | null;
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            contactNumber: string;
            organizationName: string | null;
            website: string | null;
            bio: string | null;
            logo: string | null;
            isVerified: boolean;
        } | null;
        admin: {
            name: string;
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            userId: string;
            profileImage: string | null;
            contactNumber: string;
            designation: string;
        } | null;
    } & {
        name: string;
        email: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: boolean;
        image: string | null;
        role: Role;
        status: UserStatus;
        needPasswordChange: boolean;
        isDeleted: boolean;
        password: string | null;
        needPasswordReset: boolean;
        gender: import("../../../generated/prisma/enums.js").Gender | null;
        deletedAt: Date | null;
    }>;
    getNewToken: (refreshToken: string, sessionToken: string) => Promise<{
        accessToken: string;
        refreshToken: string;
        sessionToken: string;
    }>;
    changePassword: (payload: IChangePasswordPayload, sessionToken: string) => Promise<{
        token: string | null;
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            emailVerified: boolean;
            name: string;
            image?: string | null | undefined;
        } & Record<string, any> & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            emailVerified: boolean;
            name: string;
            image?: string | null | undefined;
        };
    }>;
    logoutUser: (sessionToken: string) => Promise<{
        success: boolean;
    }>;
    verifyEmail: (email: string, otp: string) => Promise<{
        status: boolean;
        token: string;
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            emailVerified: boolean;
            name: string;
            image?: string | null | undefined;
        } & Record<string, any>;
    } | {
        status: boolean;
        token: null;
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            emailVerified: boolean;
            name: string;
            image?: string | null | undefined;
        } & Record<string, any>;
    }>;
    forgetPassword: (email: string) => Promise<{
        success: boolean;
    }>;
    resetPassword: (email: string, otp: string, newPassword: string) => Promise<{
        success: boolean;
    }>;
    googleLoginSuccess: (session: any) => Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
};
