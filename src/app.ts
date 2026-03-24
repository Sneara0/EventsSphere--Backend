import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // কুকি রিড করার জন্য
import { IndexRoutes } from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';

const app: Application = express();
app.use(express.json())
// ১. গ্লোবাল মিডলওয়্যার (Parsers & CORS)
app.use(cors({
  origin: ["http://localhost:3000"], // আপনার ফ্রন্টএন্ড ইউআরএল দিন
  credentials: true, // কুকি সহ রিকোয়েস্টের জন্য
}));
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