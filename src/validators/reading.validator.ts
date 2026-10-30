import * as z from 'zod';

const title = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(200, 'Title input has maximum 200 characters');

const exceprt = z
  .string()
  .trim()
  .min(1, 'Exceprt is required')
  .max(200, 'Exceprt input has maximum 200 characters');

const description = z
  .string()
  .trim()
  .min(10, 'Desc input has minimum 10 characters')
  .max(8000, 'Desc input has maximum 8000 characters');

const author = z
  .string()
  .trim()
  .min(1, 'Author is required')
  .max(100, 'Author input has maximum 100 characters');

export const createReadingSchema = z.object({
  body: z.object({
    title,
    exceprt,
    description,
    author,
  }),
});

export const detailReadingSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Blog slug is required')
    .max(200, 'You have reached maximum charaters input')
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/i, 'Blog slug is not valid'),
});

export type CreateReadingRequest = z.infer<typeof createReadingSchema>;
export type DetailReadingRequest = z.infer<typeof detailReadingSchema>;
