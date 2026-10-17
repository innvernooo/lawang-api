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
  .min(8, 'Password input is required, minimum 8 characters');

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

const role = z
  .enum(['CUSTOMER', 'ORGANIZER'], 'Role must be CUSTOMER or ORGANIZER')
  .optional();

// Profile picture is uploaded as a file via multer (req.file) and stored in
// users.profilePictureUrl, so size/extension checks live in upload.middleware.
export const registerUserSchema = z.object({
  body: z.object({
    name,
    username,
    email,
    password,
    phoneNumber,
    role,
    referralCode,
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    identifier,
    password,
  }),
});

export const patchUserSchema = z.object({
  body: z.object({
    name: z.preprocess(emptyToUndefined, name.optional()),
    username: z.preprocess(emptyToUndefined, username.optional()),
    phoneNumber,
  }),
});
export type NewUserInput = z.input<typeof registerUserSchema>;
export type NewUserOutput = z.output<typeof registerUserSchema>;
export type PatchUserInput = z.infer<typeof patchUserSchema>;
export type LoginUserInput = z.input<typeof loginUserSchema>;
