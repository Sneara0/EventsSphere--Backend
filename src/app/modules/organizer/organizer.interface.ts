/**
 * ১. প্রোফাইল তৈরি করার সময় যে ডেটাগুলো ইউজার থেকে নেওয়া হবে
 */
export type IOrganizerCreatePayload = {
    organizationName?: string;
    contactNumber: string;
    website?: string;
    bio?: string;
    logo?: string; 
};


export type IOrganizerUpdatePayload = Partial<IOrganizerCreatePayload> & {
    name?: string;
    email?: string;
    isVerified?: boolean;
    logo?: string;
};

