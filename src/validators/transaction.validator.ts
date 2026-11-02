import * as z from 'zod';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

export const pointStep = 10000;

const ticketTypeId = z.uuid('Ticket type ID is not valid');

const quantity = z.coerce
  .number('Quantity input must be a number')
  .int('Quantity must be a whole number')
  .min(1, 'Minimum quantity is 1 ticket per order')
  .max(4, 'Maximum quantity is 4 tickets per order');

const voucherCode = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .toUpperCase()
    .max(30, 'Maximum input is 30 characters')
    .optional(),
);

const couponCode = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .toUpperCase()
    .max(30, 'Maximum input is 30 characters')
    .optional(),
);

const pointsUsed = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number('Point input must be a number')
    .int('Point must be a whole number')
    .min(0, 'Point cannot be negative')
    .max(50000, 'Maximum point used is 50.000')
    .multipleOf(
      pointStep,
      `Points can only be used in multiple of ${pointStep}`,
    )
    .default(0),
);

export const createTransactionSchema = z.object({
  params: z.object({
    eventId: z.uuid('Event ID is not valid'),
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
    transactionId: z.uuid('Transaction ID is not valid'),
  }),
});

export const paymentSchema = z.object({
  params: z.object({
    transactionId: z.uuid('Transaction ID is not valid'),
  }),
  file: z.preprocess(
    emptyToUndefined,
    z
      .custom<Express.Multer.File>((f) => !!f, 'Payment proof is required')
      .refine(
        (f) => f.mimetype.startsWith('image/'),
        'Payment proof must be an image',
      )
      .optional(),
  ),
});

export const transpaginationSchema = z.object({
  query: z.object({
    page: z.coerce.number('input must be a number').optional().default(1),
    limit: z.coerce.number('input must be a number').optional().default(10),
  }),
});

export type CreateTransactionInput = z.input<typeof createTransactionSchema>;
export type CreateTransactionOutput = z.output<typeof createTransactionSchema>;
export type GetDetailTrasanctionOutput = z.output<
  typeof getDetailTrasanctionSchema
>;
export type PaymentOutput = z.output<typeof paymentSchema>;
export type TransPaginationRequest = z.infer<typeof transpaginationSchema>;
