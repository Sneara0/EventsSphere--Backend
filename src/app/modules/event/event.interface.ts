import { EventStatus } from "../../../generated/prisma/enums";


// ১. নতুন এয়ার টিকিট ফিল্ডসহ ক্রিয়েট পেলোড
export type IEventCreatePayload = {
    title: string;
    description: string;
    category: string; // e.g., 'FLIGHT_ONLY', 'HOLIDAY_PACKAGE'
    dateTime: string; 
    time: string;
    venue: string;    // Airport Name (e.g., HSIA)
    location: string; // Arrival City (e.g., Dubai)
    thumbnail?: string; 
    ticketPrice: number;
    totalSeats: number;
    availableSeats: number; // এটি ডাটাবেসে সেভ করার সময় লাগে

    // --- এয়ার টিকিট স্পেসিফিক ফিল্ডস (নতুন) ---
    airlineName?: string;     // যেমন: Emirates, Biman
    flightNumber?: string;    // যেমন: EK-585
    flightClass?: string;     // Economy, Business, First Class
    baggageAllowance?: string; // e.g., '30KG'
    isRefundable?: boolean;    // রিফান্ড পলিসি
};

// ২. আপডেট পেলোড (Partial)
export type IEventUpdatePayload = Partial<IEventCreatePayload> & {
    status?: EventStatus;
    isDeleted?: boolean;
};

// ৩. ফিল্টার রিকোয়েস্ট (এয়ারলাইন্স বা ক্লাস দিয়ে সার্চ করার জন্য বাড়তি ফিল্ড)
export type IEventFilterRequest = {
    searchTerm?: string;
    category?: string;
    airlineName?: string; // নির্দিষ্ট এয়ারলাইন্স ফিল্টার করার জন্য
    flightClass?: string;  // নির্দিষ্ট ক্লাস ফিল্টার করার জন্য
    minPrice?: string;
    maxPrice?: string;
    status?: EventStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: string;
    limit?: string;
};