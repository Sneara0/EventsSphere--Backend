import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { checkAuth } from '../../middlewares/checkAuth';
const router = Router();
// শুধুমাত্র একটি GET রুট থাকবে ড্যাশবোর্ড ডাটা দেখার জন্য
router.get('/', checkAuth('ADMIN', 'ORGANIZER', 'PARTICIPANT'), DashboardController.getDashboardData);
export const DashboardRoutes = router;
