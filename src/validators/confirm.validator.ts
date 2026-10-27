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
});

export type ConfirmationOutput = z.output<typeof confirmationSchema>;
export type GetTransactionOutput = z.infer<typeof getTransantionShema>;
