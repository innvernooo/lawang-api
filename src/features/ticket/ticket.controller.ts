import { Request, Response } from 'express';
import { validate } from '../../validators/validate';
import {
  addTicketTypeSchema,
  getTicketTypeSchema,
} from '../../validators/ticket.validator';
import { TicketService } from './ticket.service';
import { paginationSchema } from '../../validators/pagination.validator';

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
      message: 'Tiket berhasil dibuat',
      data: ticket,
    });
  }

  static async getTicket(req: Request, res: Response) {
    const { params } = validate(getTicketTypeSchema, { params: req.params });

    const ticket = await TicketService.getTicket({ params });

    res.status(200).json({
      success: true,
      message: 'Daftar tiket berhasil dimuat',
      data: ticket,
    });
  }

  static async getOrganizerEventForTicket(req: Request, res: Response) {
    const { payload } = res.locals;
    const { query } = validate(paginationSchema, { query: req.query });

    const { organizerEvent, totalPage } =
      await TicketService.getOrganizerEventForTicket({ query }, payload.id);

    res.status(200).json({
      success: true,
      message: 'Daftar event berhasil dimuat',
      data: organizerEvent,
      totalPage,
    });
  }
}
