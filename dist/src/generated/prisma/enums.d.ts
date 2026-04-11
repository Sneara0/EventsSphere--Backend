export declare const Role: {
    readonly SUPER_ADMIN: "SUPER_ADMIN";
    readonly ADMIN: "ADMIN";
    readonly ORGANIZER: "ORGANIZER";
    readonly USER: "USER";
    readonly PARTICIPANT: "PARTICIPANT";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const UserStatus: {
    readonly ACTIVE: "ACTIVE";
    readonly BLOCKED: "BLOCKED";
    readonly DELETED: "DELETED";
};
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export declare const Gender: {
    readonly MALE: "MALE";
    readonly FEMALE: "FEMALE";
    readonly OTHER: "OTHER";
};
export type Gender = (typeof Gender)[keyof typeof Gender];
export declare const BookingStatus: {
    readonly PENDING: "PENDING";
    readonly SUCCESS: "SUCCESS";
    readonly FAILED: "FAILED";
    readonly CANCELLED: "CANCELLED";
};
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
export declare const PaymentStatus: {
    readonly PENDING: "PENDING";
    readonly UNPAID: "UNPAID";
    readonly PAID: "PAID";
    readonly REFUNDED: "REFUNDED";
};
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export declare const EventStatus: {
    readonly UPCOMING: "UPCOMING";
    readonly ON_BOARDING: "ON_BOARDING";
    readonly DEPARTED: "DEPARTED";
    readonly ARRIVED: "ARRIVED";
    readonly CANCELLED: "CANCELLED";
    readonly DELAYED: "DELAYED";
};
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];
