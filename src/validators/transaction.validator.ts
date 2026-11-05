import * as z from 'zod';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

export const pointStep = 10000;

const ticketTypeId = z.uuid('Pilih jenis tiket terlebih dahulu');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const quantity = z.coerce
  .number('Jumlah tiket harus berupa angka')
  .int('Jumlah tiket harus bilangan bulat')
  .min(1, 'Minimal 1 tiket per pesanan')
  .max(4, 'Maksimal 4 tiket per pesanan');

const voucherCode = z.preprocess(
  emptyToUndefined,
  z.string().trim().toUpperCase().max(30, 'Maksimal 30 karakter').optional(),
);

const couponCode = z.preprocess(
  emptyToUndefined,
  z.string().trim().toUpperCase().max(30, 'Maksimal 30 karakter').optional(),
);

const pointsUsed = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number('Poin harus berupa angka')
    .int('Poin harus bilangan bulat')
    .min(0, 'Poin tidak boleh negatif')
    .max(50000, 'Poin yang dipakai maksimal 50.000')
    .multipleOf(
      pointStep,
      `Poin hanya bisa dipakai dalam kelipatan ${pointStep}`,
    )
    .default(0),
);

export const createTransactionSchema = z.object({
  params: z.object({
    eventId: z.uuid('ID event tidak valid'),
  }),

  body: z.object({
    ticketTypeId,
    quantity,
    voucherCode,
    couponCode,
    pointsUsed,
  }),
});

export const getDetailTrasanctionSchema = z.object({
  params: z.object({
    transactionId: z.uuid('ID transaksi tidak valid'),
  }),
});

export const paymentSchema = z.object({
  params: z.object({
    transactionId: z.uuid('ID transaksi tidak valid'),
  }),
  file: z.preprocess(
    emptyToUndefined,
    z
      .custom<Express.Multer.File>(
        (f) => !!f,
        'Bukti pembayaran wajib diunggah',
      )
      .refine(
        (f) => ALLOWED_TYPES.includes(f.mimetype),
        'Bukti pembayaran harus berformat JPG, PNG, atau WEBP',
      )
      .optional(),
  ),
});

export const transpaginationSchema = z.object({
  query: z.object({
    page: z.coerce.number('Input harus berupa angka').optional().default(1),
    limit: z.coerce.number('Input harus berupa angka').optional().default(10),
  }),
});

export type CreateTransactionInput = z.input<typeof createTransactionSchema>;
export type CreateTransactionOutput = z.output<typeof createTransactionSchema>;
export type GetDetailTrasanctionOutput = z.output<
  typeof getDetailTrasanctionSchema
>;
export type PaymentOutput = z.output<typeof paymentSchema>;
export type TransPaginationRequest = z.infer<typeof transpaginationSchema>;
