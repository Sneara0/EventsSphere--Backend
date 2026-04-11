export type IAdminDashboardStats = {
    userCounts: {
        role: string;
        _count: number;
    }[];
    eventStats: {
        status: string;
        _count: number;
    }[];
    revenueStats: {
        _sum: {
            totalAmount: number | null;
        };
        _count: {
            id: number;
        };
    };
};
export type IOrganizerDashboardStats = {
    totalEvents: number;
    totalSales: number;
    totalEarnings: number;
    eventPerformance: {
        id: string;
        title: string;
        sales: number;
        avgRating: number;
    }[];
};
export type IUserDashboardStats = {
    upcomingEvents: any[];
    pastEvents: any[];
    totalSpent: number;
    myReviews: any[];
};
