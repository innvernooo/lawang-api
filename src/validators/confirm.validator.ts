import * as z from 'zod';

export const confirmationSchema = z.object({
  params: z.object({
    transactionId: z.uuid('ID transaksi tidak valid'),
  }),
});

export const getTransantionShema = z.object({
  params: z.object({
    eventId: z.uuid('ID event tidak valid'),
  }),

  query: z.object({
    page: z.coerce.number('Input harus berupa angka').optional().default(1),
    limit: z.coerce.number('Input harus berupa angka').optional().default(10),
  }),
});

export type ConfirmationOutput = z.output<typeof confirmationSchema>;
export type GetTransactionOutput = z.infer<typeof getTransantionShema>;
