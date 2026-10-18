import * as z from 'zod';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

const name = z
  .string()
  .trim()
  .min(1, 'Fullname input is required')
  .max(100, 'Fullname input has maximum 100 characters');

const username = z
  .string()
  .trim()
  .min(5, 'Username input is required, minimum 5 characters')
  .max(50, 'Username input has maximum 50 characters');

const email = z
  .email('Invalid email format')
  .trim()
  .max(255, 'Email input has maximum 255 characters');

const password = z
  .string()
  .min(1, 'Password input is required');

const identifier = z
  .string()
  .trim()
  .min(1, 'Email or username is required')
  .max(255, 'Email or username has maximum 255 characters');

const referralCode = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .toUpperCase()
    .length(12, 'Referral code must be 12 characters')
    .optional(),
);

const phoneNumber = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .max(20, 'Phone number input has maximum 20 characters')
    .regex(/^\+?[0-9]+$/, 'Phone number must contain digits only')
    .optional(),
);

const nik = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .regex(/^[0-9]{16}$/, 'NIK must be 16 digits')
    .optional(),
);

export const registerCustomerSchema = z.object({
  body: z.object({
    name,
    username,
    email,
    password,
    phoneNumber,
    nik,
    referralCode,
  }),
});

export const loginCustomerSchema = z.object({
  body: z.object({
    identifier,
    password,
  }),
});

export const patchCustomerSchema = z.object({
  body: z.object({
    name: z.preprocess(emptyToUndefined, name.optional()),
    username: z.preprocess(emptyToUndefined, username.optional()),
    phoneNumber,
  }),
});
export type NewCustomerInput = z.input<typeof registerCustomerSchema>;
export type NewCustomerOutput = z.output<typeof registerCustomerSchema>;
export type PatchCustomerInput = z.infer<typeof patchCustomerSchema>;
export type LoginCustomerInput = z.input<typeof loginCustomerSchema>;
