import { Router } from 'express';
import { TicketController } from './ticket.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

export const ticketRouter = Router();

ticketRouter.post(
  '/addTicket/:eventId',
  authenticate,
  authorize(['ORGANIZER']),
  TicketController.addTicket,
);
ticketRouter.get(
  '/event',
  authenticate,
  authorize(['ORGANIZER']),
  TicketController.getOrganizerEventForTicket,
);
ticketRouter.get('/:eventId', TicketController.getTicket);
