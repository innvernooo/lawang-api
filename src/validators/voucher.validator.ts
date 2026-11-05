import * as z from 'zod';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

const dateTime = (label: string) =>
  z.iso
    .datetime({
      offset: true,
      message: `${label} harus berupa tanggal dan waktu yang valid`,
    })
    .pipe(z.coerce.date());

const code = z
  .string()
  .toUpperCase()
  .min(5, 'Kode voucher minimal 5 karakter')
  .max(30, 'Maksimal 30 karakter')
  .regex(/-/, 'Kode voucher harus mengandung tanda "-"');

const discountAmount = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number('Nominal diskon harus berupa angka')
    .int('Nominal diskon harus bilangan bulat')
    .min(0, 'Nominal diskon tidak boleh negatif')
    .max(2000000000, 'Nominal diskon terlalu besar'),
);

const quota = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number('Kuota harus berupa angka')
    .int('Kuota harus bilangan bulat')
    .min(0, 'Kuota tidak boleh negatif')
    .max(1000, 'Kuota maksimal 1.000'),
);

const startDate = dateTime('Tanggal mulai');

const endDate = dateTime('Tanggal selesai');

export const createVoucherSchema = z.object({
  params: z.object({
    eventId: z.uuid('ID event tidak valid'),
  }),

  body: z.object({
    code,
    discountAmount,
    quota,
    startDate,
    endDate,
  }),
});

export type CreateVoucherOutput = z.output<typeof createVoucherSchema>;
