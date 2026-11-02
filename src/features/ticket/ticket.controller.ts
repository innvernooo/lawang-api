import { Request, Response } from 'express';
import { validate } from '../../validators/validate';
import {
  addTicketTypeSchema,
  getTicketTypeSchema,
} from '../../validators/ticket.validator';
import { TicketService } from './ticket.service';

export class TicketController {
  static async addTicket(req: Request, res: Response) {
    const { payload } = res.locals;
    const { body, params } = validate(addTicketTypeSchema, {
      body: req.body,
      params: req.params,
    });

    const ticket = await TicketService.addTicket({ body, params }, payload.id);

    res.status(201).json({
      success: true,
      message: 'Ticket type created successfully',
      data: ticket,
    });
  }

  static async getTicket(req: Request, res: Response) {
    const { params } = validate(getTicketTypeSchema, { params: req.params });

    const ticket = await TicketService.getTicket({ params });

    res.status(200).json({
      success: true,
      message: 'Ticket type retrieved successfully',
      data: ticket,
    });
  }

  static async getOrganizerEventForTicket(req: Request, res: Response) {
    const { payload } = res.locals;

    const event = await TicketService.getOrganizerEventForTicket(payload.id);

    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: event,
    });
  }
}
