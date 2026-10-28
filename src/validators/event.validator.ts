import * as z from 'zod';
import { cities } from '../constants/cities';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

const dateTime = (label: string) =>
  z.iso
    .datetime({
      offset: true,
      message: `${label} must be a valid date-time with timezone, e.g. 2026-07-20T19:00:00+07:00`,
    })
    .pipe(z.coerce.date());

const categories = [
  'WORKSHOP',
  'MUSIC',
  'SPORTS',
  'ARTS',
  'GAMES',
  'COMEDY',
] as const;

const organizerId = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .min(1, 'Organizer ID is required')
    .max(150, 'Maximum input is 150 characters')
    .optional(),
);
const name = z
  .string()
  .trim()
  .min(1, 'Event name is required')
  .max(200, 'Maximum input is 200 characters');

const description = z.string().trim().min(1, 'Event description is required');

const category = z.enum(categories, 'Pick one of the categories');

const city = z.enum(cities, 'Pick one of the cities');

const venue = z
  .string()
  .min(1, 'Event venue is required')
  .max(200, 'Maximum input is 200 characters');

const pricingType = z.enum(
  ['PAID', 'FREE'],
  'Pricing type must be PAID or FREE',
);

const startDate = dateTime('Start date').refine(
  (d) => d.getTime() > Date.now(),
  'Start date must be in the future',
);

const endDate = dateTime('End date');

const totalSeats = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number('Total seats must be a number')
    .pipe(
      z
        .int32('Total seats must be a whole number')
        .min(1, 'Total seats must be at least 1'),
    ),
);

export const createEventSchema = z.object({
  body: z.object({
    organizerId,
    name,
    description,
    category,
    city,
    venue,
    pricingType,
    startDate,
    endDate,
    totalSeats,
  }),
});

export const getUpcomingEventsSchema = z.object({
  query: z.object({
    page: z.coerce.number('input must be a number').optional().default(1),
    limit: z.coerce.number('input must be a number').optional().default(12),
  }),
});

export const getEventDetailSchema = z.object({
  params: z.object({
    slug: z
      .string()
      .trim()
      .min(1, 'Event slug is required')
      .max(200, 'You have reached maximum charaters input')
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/i, 'Event slug is not valid'),
  }),
});

export const getOrganizerEventDetailSchema = z.object({
  params: z.object({
    eventId: z.uuid('Event ID is not valid'),
  }),
});

export const getEventCategoriesSchema = z.object({
  query: z.object({
    category: z.enum(categories).optional(),
    search: z
      .string()
      .trim()
      .max(100, 'Maximum search is 100 characters')
      .optional(),
    page: z.coerce.number('input must be a number').optional().default(1),
    limit: z.coerce.number('input must be a number').optional().default(8),
  }),
});

export type CreateEventInput = z.input<typeof createEventSchema>;
export type CreateEventOutput = z.output<typeof createEventSchema>;
export type GetUpcomingEventsRequest = z.infer<typeof getUpcomingEventsSchema>;
export type GetEventDetailRequest = z.infer<typeof getEventDetailSchema>;
export type GetOrganizerEventDetailRequest = z.infer<
  typeof getOrganizerEventDetailSchema
>;
export type GetEventCategoriesRequest = z.infer<
  typeof getEventCategoriesSchema
>;
