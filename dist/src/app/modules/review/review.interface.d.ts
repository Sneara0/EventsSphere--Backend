/**
 * ১. নতুন রিভিউ তৈরি করার জন্য রিকোয়েস্ট পেলোড ইন্টারফেস
 * (এটি কন্ট্রোলার এবং সার্ভিসে টাইপ সেফটি নিশ্চিত করবে)
 */
export type IReviewCreatePayload = {
    rating: number;
    comment: string;
    eventId: string;
};
/**
 * ২. রিভিউ আপডেট করার জন্য ইন্টারফেস
 * (এখানে সব ফিল্ড অপশনাল রাখা হয়েছে)
 */
export type IReviewUpdatePayload = {
    rating?: number;
    comment?: string;
};
/**
 * ৩. রিভিউ এর বিস্তারিত ডেটা টাইপ (Optional)
 * যা প্রিজমা থেকে রিটার্ন পাওয়া অবজেক্টের সাথে মিলবে
 */
export type IReview = {
    id: string;
    rating: number;
    comment: string;
    userId: string;
    eventId: string;
    createdAt: Date;
    updatedAt: Date;
};
