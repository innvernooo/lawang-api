import 'dotenv/config';
import express from 'express';
import { corsOptions } from './configs/cors.config';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error.middleware';
import { customerRouter } from './features/customer/customer.route';
import cookieParser from 'cookie-parser';
import { organizerRouter } from './features/organizer/organizer.route';
import { authRouter } from './features/auth/auth.route';
import { eventRouter } from './features/event/event.route';
import { ticketRouter } from './features/ticket/ticket.route';
import { transactionRouter } from './features/transaction/transaction.route';
import { confirmationRouter } from './features/confirmation/confirm.route';
import job from './jobs/expiringSchedule';
import { voucherRouter } from './features/voucher/voucher.router';

const PORT: number = parseInt(process.env.PORT!);
const API_PREFIX: string = process.env.API_PREFIX!;

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(`${API_PREFIX}/customers`, customerRouter);
app.use(`${API_PREFIX}/organizers`, organizerRouter);
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/events`, eventRouter);
app.use(`${API_PREFIX}/tickets`, ticketRouter);
app.use(`${API_PREFIX}/transactions`, transactionRouter);
app.use(`${API_PREFIX}/confirmations`, confirmationRouter);
app.use(`${API_PREFIX}/vouchers`, voucherRouter);

app.use(errorMiddleware);

if (process.env.NODE_ENV === 'DEVELOPMENT')
  app.listen(PORT, () => {
    console.log(`Application Running on PORT: ${PORT}`);
    job.start();
  });

export default app;
