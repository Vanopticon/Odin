import { z } from 'zod';

export const TriggerCreate = z.object({
	name: z.string().min(1),
	expression: z.string().min(1),
	enabled: z.boolean().optional().default(true)
});

export const Trigger = TriggerCreate.extend({
	id: z.string(),
	created_at: z.string().optional()
});

export const TriggerUpdate = z.object({
	id: z.string().uuid(),
	name: z.string().optional(),
	expression: z.string().optional(),
	enabled: z.boolean().optional()
});

export type TriggerCreate = z.infer<typeof TriggerCreate>;
export type Trigger = z.infer<typeof Trigger>;
