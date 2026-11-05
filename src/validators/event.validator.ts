import * as z from 'zod';
import { cities } from '../constants/cities';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

const dateTime = (label: string) =>
  z.iso
    .datetime({
      offset: true,
      message: `${label} harus berupa tanggal dan waktu yang valid, contoh: 2026-07-20T19:00:00+07:00`,
    })
    .pipe(z.coerce.date());

const categories = [
  'MUSIK',
  'WORKSHOP',
  'KOMEDI',
  'OLAHRAGA',
  'SENI',
  'GAMES',
  'SPIRITUALITAS',
  'K_POP',
  'KELUARGA',
  'ALAM_TERBUKA',
  'SAINS',
  'PENDIDIKAN',
  'BUDAYA',
  'KESEHATAN',
  'OTOMOTIF',
] as const;

const organizerId = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .min(1, 'ID Event Organizer wajib diisi')
    .max(150, 'Maksimal 150 karakter')
    .optional(),
);
const name = z
  .string()
  .trim()
  .min(1, 'Nama event wajib diisi')
  .max(200, 'Maksimal 200 karakter');

const description = z.string().trim().min(1, 'Deskripsi event wajib diisi');

const category = z.enum(categories, 'Pilih salah satu kategori');

const city = z.enum(cities, 'Pilih salah satu kota');

const venue = z
  .string()
  .min(1, 'Lokasi event wajib diisi')
  .max(200, 'Maksimal 200 karakter');

const pricingType = z.enum(
  ['PAID', 'FREE'],
  'Pilih jenis harga: Berbayar atau Gratis',
);

const startDate = dateTime('Tanggal mulai').refine(
  (d) => d.getTime() > Date.now(),
  'Tanggal mulai harus setelah waktu sekarang',
);

const endDate = dateTime('Tanggal selesai');

const totalSeats = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number('Jumlah kursi harus berupa angka')
    .pipe(
      z
        .int32('Jumlah kursi harus bilangan bulat')
        .min(1, 'Jumlah kursi minimal 1'),
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
    page: z.coerce.number('Input harus berupa angka').optional().default(1),
    limit: z.coerce.number('Input harus berupa angka').optional().default(12),
  }),
});

export const getEventDetailSchema = z.object({
  params: z.object({
    slug: z
      .string()
      .trim()
      .min(1, 'Slug event wajib diisi')
      .max(200, 'Input melebihi batas karakter')
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/i, 'Slug event tidak valid'),
  }),
});

export const getOrganizerEventDetailSchema = z.object({
  params: z.object({
    eventId: z.uuid('ID event tidak valid'),
  }),
});

export const getEventCategoriesSchema = z.object({
  query: z.object({
    category: z.enum(categories).optional(),
    city: z.enum(cities, 'Pilih salah satu kota').optional(),
    search: z
      .string()
      .trim()
      .max(100, 'Kata kunci pencarian maksimal 100 karakter')
      .optional(),
    page: z.coerce.number('Input harus berupa angka').optional().default(1),
    limit: z.coerce.number('Input harus berupa angka').optional().default(8),
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
