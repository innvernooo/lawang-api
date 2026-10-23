import { Router } from 'express';
import { TicketController } from './ticket.controller';

export const ticketRouter = Router();

ticketRouter.post('/addTicket/:eventId', TicketController.addTicket);
ticketRouter.get('/:eventId', TicketController.getTicket);
