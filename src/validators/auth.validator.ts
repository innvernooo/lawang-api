import * as z from 'zod';

const identifier = z
  .string()
  .trim()
  .min(1, 'Email or username is required')
  .max(255, 'Email or username has maximum 255 characters');

const password = z
  .string()
  .min(1, 'Password input is required')
  .max(255, 'Maximum input has maximum 255 characters');

export const loginSchema = z.object({
  body: z.object({
    identifier,
    password,
  }),
});

export type LoginInput = z.input<typeof loginSchema>;
