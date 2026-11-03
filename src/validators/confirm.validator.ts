import * as z from 'zod';

export const confirmationSchema = z.object({
  params: z.object({
    transactionId: z.uuid('Transaction ID is not valid'),
  }),
});

export const getTransantionShema = z.object({
  params: z.object({
    eventId: z.uuid('Event ID is not valid'),
  }),

  query: z.object({
    page: z.coerce.number('input must be a number').optional().default(1),
    limit: z.coerce.number('input must be a number').optional().default(10),
  }),
});

export type ConfirmationOutput = z.output<typeof confirmationSchema>;
export type GetTransactionOutput = z.infer<typeof getTransantionShema>;
