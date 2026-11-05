import * as z from 'zod';

const title = z
  .string()
  .trim()
  .min(1, 'Judul wajib diisi')
  .max(200, 'Judul maksimal 200 karakter');

const exceprt = z
  .string()
  .trim()
  .min(1, 'Ringkasan wajib diisi')
  .max(200, 'Ringkasan maksimal 200 karakter');

const description = z
  .string()
  .trim()
  .min(10, 'Isi artikel minimal 10 karakter')
  .max(8000, 'Isi artikel maksimal 8000 karakter');

const author = z
  .string()
  .trim()
  .min(1, 'Nama penulis wajib diisi')
  .max(100, 'Nama penulis maksimal 100 karakter');

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
    .min(1, 'Slug artikel wajib diisi')
    .max(200, 'Input melebihi batas karakter')
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/i, 'Slug artikel tidak valid'),
});

export type CreateReadingRequest = z.infer<typeof createReadingSchema>;
export type DetailReadingRequest = z.infer<typeof detailReadingSchema>;
