import * as z from 'zod';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

const dateTime = (label: string) =>
  z.iso
    .datetime({
      offset: true,
      message: `${label} harus berupa tanggal dan waktu yang valid, contoh: 2026-07-20T19:00:00+07:00`,
    })
    .pipe(z.coerce.date());

export const addTicketTypeSchema = z.object({
  params: z.object({
    eventId: z
      .uuid('ID event tidak valid')
      .min(1, 'ID event wajib diisi')
      .max(70, 'Input melebihi batas karakter'),
  }),

  body: z.object({
    name: z
      .string()
      .min(1, 'Nama tiket wajib diisi')
      .max(100, 'Maksimal 100 karakter'),

    price: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number('Harga harus berupa angka')
        .int('Harga harus bilangan bulat')
        .min(0, 'Harga tiket tidak boleh negatif')
        .max(2000000000, 'Harga terlalu besar'),
    ),

    quota: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number('Kuota harus berupa angka')
        .int('Kuota harus bilangan bulat')
        .min(1, 'Kuota minimal 1')
        .max(10000, 'Kuota maksimal 10.000'),
    ),
    endSale: z.preprocess(emptyToUndefined, dateTime('Batas akhir penjualan')).optional(),
  }),
});

export const getTicketTypeSchema = z.object({
  params: z.object({
    eventId: z
      .uuid('ID event tidak valid')
      .min(1, 'ID event wajib diisi')
      .max(70, 'Input melebihi batas karakter'),
  }),
});

export type TicketTypeInput = z.input<typeof addTicketTypeSchema>;
export type TicketTypeOutput = z.output<typeof addTicketTypeSchema>;
export type GetTicketTypeRequest = z.infer<typeof getTicketTypeSchema>;
