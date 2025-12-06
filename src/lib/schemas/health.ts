import { z } from 'zod';

export const HealthResponse = z.object({
	status: z.string().default('ok'),
	timestamp: z.string().optional(),
	uptime_seconds: z.number().optional()
});

export type HealthResponse = z.infer<typeof HealthResponse>;
