import { Request, Response } from 'express';
import { validate } from '../../validators/validate';
import { organizerRegisterSchema } from '../../validators/organizer.validator';
import { OrganizerService } from './organizer.service';

export class OrganizerController {
  static async register(req: Request, res: Response) {
    const file: Express.Multer.File[] =
      (
        req.files as { [filename: string]: Express.Multer.File[] } | undefined
      )?.['profilePicture'] ?? [];

    const { body } = validate(organizerRegisterSchema, { body: req.body });

    const organizer = await OrganizerService.register({ body }, file);

    res.status(201).json({
      success: true,
      message: 'Event Organizer registered successfully',
      data: organizer,
    });
  }

  static async profile(req: Request, res: Response) {
    const { payload } = res.locals;

    const organizer = await OrganizerService.profile(payload.id);

    res.status(200).json({
      success: true,
      message: 'Organizer data retrieved successfully',
      data: organizer,
    });
  }
}
