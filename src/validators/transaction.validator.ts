import * as z from 'zod';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

export const pointStep = 10000;

const customerId = z.uuid('Customer ID is not valid');

const eventId = z.uuid('Event ID is not valid');

const ticketTypeId = z.uuid('Ticket type ID is not valid');

const quantity = z.coerce
  .number('Quantity input must be a number')
  .int('Quantity must be a whole number')
  .min(1, 'Minimum quantity is 1 ticket per order')
  .max(4, 'Maximum quantity is 4 tickets per order');

const unitPrice = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number('Unit price input must be a number')
    .int('Unit price must be a whole number')
    .min(0, 'Unit price is required')
    .max(2000000000, 'Unit price is too large'),
);

const subtotal = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number('Subtotal input must be a number')
    .int('Subtotal must be a whole number')
    .min(0, 'Subtotal is required')
    .max(2000000000, 'Subtotal is too large'),
);

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

const totalPrice = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number('Total price input must be a number')
    .int('Total price must be a whole number')
    .min(0, 'Total price is required')
    .max(2000000000, 'Total price is too large'),
);

const status = z.enum(
  [
    'WAITING_PAYMENT',
    'WAITING_CONFIRMATION',
    'DONE',
    'REJECTED',
    'EXPIRED',
    'CANCELED',
  ],
  'Status must be WAITING_PAYMENT, WAITING_CONFIRMATION, DONE, REJECTED, EXPIRED, CANCELED',
);

const paymentProofUrl = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .min(1, 'Payment proof URL is required')
    .max(500, 'Maximum input is 500 characters')
    .optional(),
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
  file: z
    .custom<Express.Multer.File>((f) => !!f, 'Payment proof is required')
    .refine(
      (f) => f.mimetype.startsWith('image/'),
      'Payment proof must be an image',
    ),
});



export type CreateTransactionInput = z.input<typeof createTransactionSchema>;
export type CreateTransactionOutput = z.output<typeof createTransactionSchema>;
export type GetDetailTrasanctionOutput = z.output<
  typeof getDetailTrasanctionSchema
>;
export type PaymentOutput = z.output<typeof paymentSchema>;
