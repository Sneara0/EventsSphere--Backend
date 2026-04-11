import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { DashboardService } from './dashboard.service';
const getDashboardData = catchAsync(async (req, res) => {
    // auth middleware থেকে পাওয়া ইউজার ডাটা
    const user = req.user;
    const { id: userId, role } = user;
    let result;
    // রোলের ওপর ভিত্তি করে আলাদা সার্ভিস কল করা (Switch ব্যবহার করা ক্লিন)
    switch (role) {
        case 'ADMIN':
            result = await DashboardService.getAdminStats();
            break;
        case 'ORGANIZER':
            result = await DashboardService.getOrganizerStats(userId);
            break;
        case 'PARTICIPANT': // আপনার প্রোজেক্টে যদি 'USER' হয় তবে সেটি দিন
            result = await DashboardService.getUserStats(userId);
            break;
        default:
            result = null;
    }
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `${role} dashboard data retrieved successfully`,
        data: result,
    });
});
export const DashboardController = {
    getDashboardData
};
