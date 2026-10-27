import * as z from 'zod';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

const dateTime = (label: string) =>
  z.iso
    .datetime({
      offset: true,
      message: `${label} must be a valid date-time with timezone`,
    })
    .pipe(z.coerce.date());

const code = z
  .string()
  .toUpperCase()
  .min(5, 'Minimum input is 5 characters')
  .max(30, 'Maximum input is 30 characters')
  .regex(/-/, 'Voucher code must contain "-"');

const discountAmount = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number('Discount amount must be a number')
    .int('Discount amount must be a whole number')
    .min(0, 'Discount amount is required')
    .max(2000000000, 'Discount amount too large'),
);

const quota = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number('Quota must be a number')
    .int('Quota must be a whole number')
    .min(0, 'Quota is required')
    .max(1000, 'Quota too large'),
);

const startDate = dateTime('Start Date');

const endDate = dateTime('End Date');

export const createVoucherSchema = z.object({
  params: z.object({
    eventId: z.uuid('Event ID is not valid'),
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
