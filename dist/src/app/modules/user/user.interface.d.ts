import { Role, UserStatus } from "../../../generated/prisma/enums.js";
export type IUser = {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: UserStatus;
    image?: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type IUserUpdatePayload = {
    name?: string;
    image?: string;
    contactNumber?: string;
    address?: string;
    bio?: string;
};
export type IUserFilterRequest = {
    searchTerm?: string;
    role?: Role;
    status?: UserStatus;
    email?: string;
};
export type IUserOptions = {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
};
