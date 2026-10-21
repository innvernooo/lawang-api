import { Request, Response } from 'express';
import { validate } from '../../validators/validate';
import {
  createEventSchema,
  getUpcomingEventsSchema,
} from '../../validators/event.validator';
import { EventService } from './event.service';

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
      message: 'Event created successfully',
      data: event,
    });
  }

  static async upcomingEvents(req: Request, res: Response) {
    const { query } = validate(getUpcomingEventsSchema, { query: req.query });

    const event = await EventService.getUpcomingEvents({ query });

    res.status(200).json({
      success: true,
      message: 'Upcoming events retrieved successfully',
      data: event,
    });
  }
}
