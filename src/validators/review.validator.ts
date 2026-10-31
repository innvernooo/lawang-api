import * as z from 'zod';

const rating = z.coerce
  .number('Rating must be a number')
  .int('Rating must be a whole number')
  .min(1, 'Minimum rating is 1')
  .max(5, 'Maximum rating is 5');

const comment = z
  .string()
  .trim()
  .min(5, 'Minimum comment is 5 characters')
  .max(1000, 'Maximum comment is 1000 characters');

export const createReviewSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1, 'Event slug is required'),
  }),

  body: z.object({
    rating,
    comment,
  }),
});

export type CreateReviewRequest = z.infer<typeof createReviewSchema>;
