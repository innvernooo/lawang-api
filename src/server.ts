import 'dotenv/config';
import express from 'express';
import { corsOptions } from './configs/cors.config';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error.middleware';
import { customerRouter } from './features/customer/customer.route';
import cookieParser from 'cookie-parser';
import { organizerRouter } from './features/organizer/organizer.route';
import { authRouter } from './features/auth/auth.route';

const PORT: number = parseInt(process.env.PORT!);
const API_PREFIX: string = process.env.API_PREFIX!;

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(`${API_PREFIX}/customers`, customerRouter);
app.use(`${API_PREFIX}/organizers`, organizerRouter);
app.use(`${API_PREFIX}/auth`, authRouter);

app.use(errorMiddleware);

if (process.env.NODE_ENV === 'DEVELOPMENT')
  app.listen(PORT, () => {
    console.log(`Application Running on PORT: ${PORT}`);
  });

export default app;
