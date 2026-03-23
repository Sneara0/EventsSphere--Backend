import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { IndexRoutes } from './app/routes';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use("/api/v1", IndexRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send({ message: 'EventSphere Server is Running! 🚀' });
});

export default app;