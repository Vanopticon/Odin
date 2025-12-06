import { z } from 'zod';

export const LoginRequest = z.object({
	redirect: z.string().url().optional()
});

export type LoginRequest = z.infer<typeof LoginRequest>;
