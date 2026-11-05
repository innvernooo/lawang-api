import { Request, Response } from 'express';
import { validate } from '../../validators/validate';
import {
  createEventSchema,
  getEventCategoriesSchema,
  getEventDetailSchema,
  getOrganizerEventDetailSchema,
  getUpcomingEventsSchema,
} from '../../validators/event.validator';
import { EventService } from './event.service';
import { paginationSchema } from '../../validators/pagination.validator';

export class EventController {
  static async create(req: Request, res: Response) {
    const file: Express.Multer.File[] =
      (
        req.files as { [filename: string]: Express.Multer.File[] } | undefined
      )?.['profilePicture'] ?? [];
    const { body } = validate(createEventSchema, { body: req.body });

    const event = await EventService.create(
      { body },
      file,
      res?.locals?.payload?.id,
    );

    res.status(201).json({
      success: true,
      message: 'Event berhasil dibuat',
      data: event,
    });
  }

  static async upcomingEvents(req: Request, res: Response) {
    const { query } = validate(getUpcomingEventsSchema, { query: req.query });

    const event = await EventService.getUpcomingEvents({ query });

    res.status(200).json({
      success: true,
      message: 'Event mendatang berhasil dimuat',
      data: event,
    });
  }

  static async kpopEvents(req: Request, res: Response) {
    const { query } = validate(getUpcomingEventsSchema, { query: req.query });

    const event = await EventService.getKpopEvents({ query });

    res.status(200).json({
      success: true,
      message: 'Event K-Pop berhasil dimuat',
      data: event,
    });
  }

  static async weeklyEvent(_: Request, res: Response) {
    const event = await EventService.getWeeklyEvents();

    res.status(200).json({
      success: true,
      message: 'Event minggu ini berhasil dimuat',
      data: event,
    });
  }

  static async musicEvent(_: Request, res: Response) {
    const event = await EventService.getMusicEvents();

    res.status(200).json({
      success: true,
      message: 'Event musik berhasil dimuat',
      data: event,
    });
  }

  static async scienceEvent(_: Request, res: Response) {
    const event = await EventService.getScienceEvents();

    res.status(200).json({
      success: true,
      message: 'Event sains berhasil dimuat',
      data: event,
    });
  }

  static async getEventDetail(req: Request, res: Response) {
    const { params } = validate(getEventDetailSchema, { params: req.params });

    const event = await EventService.getEventDetail({ params });

    res.status(200).json({
      success: true,
      message: 'Detail event berhasil dimuat',
      data: event,
    });
  }

  static async getOrganizerEvent(req: Request, res: Response) {
    const { payload } = res.locals;
    const { query } = validate(paginationSchema, { query: req.query });

    const { organizerEvent, totalPage } = await EventService.getOrganizerEvent(
      { query },
      payload.id,
    );

    res.status(200).json({
      success: true,
      message: 'Daftar event berhasil dimuat',
      data: organizerEvent,
      totalPage,
    });
  }

  //Ini controller untuk ambil event organizer
  static async getOrganizerEventDetail(req: Request, res: Response) {
    const { payload } = res.locals;
    const { params } = validate(getOrganizerEventDetailSchema, {
      params: req.params,
    });

    const event = await EventService.getOrganizerEventDetail(
      { params },
      payload.id,
    );

    res.status(200).json({
      success: true,
      message: 'Daftar event berhasil dimuat',
      data: event,
    });
  }

  static async getEventCategories(req: Request, res: Response) {
    const { query } = validate(getEventCategoriesSchema, { query: req.query });

    const { events, page, totalEvent, totalPage } =
      await EventService.getEventCategories({ query });

    res.status(200).json({
      success: true,
      message: 'Daftar event berhasil dimuat',
      data: events,
      meta: {
        page,
        totalEvent,
        totalPage,
      },
    });
  }
}
