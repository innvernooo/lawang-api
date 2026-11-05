import * as z from 'zod';

const rating = z.coerce
  .number('Rating harus berupa angka')
  .int('Rating harus bilangan bulat')
  .min(1, 'Rating minimal 1 bintang')
  .max(5, 'Rating maksimal 5 bintang');

const comment = z
  .string()
  .trim()
  .min(5, 'Komentar minimal 5 karakter')
  .max(1000, 'Komentar maksimal 1000 karakter');

export const createReviewSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1, 'Slug event wajib diisi'),
  }),

  body: z.object({
    rating,
    comment,
  }),
});

export const getReviewByEventSchema = z.object({
  params: z.object({
    eventId: z.uuid('ID event tidak valid'),
  }),
});

export type CreateReviewRequest = z.infer<typeof createReviewSchema>;
export type GetReviewByEventRequest = z.infer<typeof getReviewByEventSchema>;
