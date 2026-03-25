import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { EventRoutes } from "../modules/event/event.route"; 

const router = Router();


router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/events", EventRoutes); 

export const IndexRoutes = router;