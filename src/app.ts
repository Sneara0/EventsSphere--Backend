import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // কুকি রিড করার জন্য
import { IndexRoutes } from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import env from "src/config/env";

const app: Application = express();
app.use(express.json())
// ১. গ্লোবাল মিডলওয়্যার (Parsers & CORS)







app.post("/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    console.log("Received webhook:", req.body);
    // Process the webhook data here (e.g., verify signature, update database, etc.)
    res.status(200).json({ received: true });
}
)








app.use(cors({
    origin : [env.FRONTEND_URL, env.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
    credentials : true,
    methods : ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders : ["Content-Type", "Authorization"]
}))
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1", IndexRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send({ 
    success: true,
    message: 'EventSphere Server is Running! 🚀' 
  });
});


app.use(globalErrorHandler);


app.use(notFound);

export default app;