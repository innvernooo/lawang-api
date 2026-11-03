import * as z from 'zod';

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number('input must be a number').optional().default(1),
    limit: z.coerce.number('input must be a number').optional().default(10),
  }),
});

export type PaginationRequest = z.infer<typeof paginationSchema>;
