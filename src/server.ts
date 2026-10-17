import 'dotenv/config';
import express from 'express';
import { corsOptions } from './configs/cors.config';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error.middleware';
import { userRouter } from './features/user/auth.route';
import cookieParser from 'cookie-parser';

const PORT: number = parseInt(process.env.PORT!);
const API_PREFIX: string = process.env.API_PREFIX!;

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(`${API_PREFIX}/users`, userRouter);

app.use(errorMiddleware);

if (process.env.NODE_ENV === 'DEVELOPMENT')
  app.listen(PORT, () => {
    console.log(`Application Running on PORT: ${PORT}`);
  });

export default app;
