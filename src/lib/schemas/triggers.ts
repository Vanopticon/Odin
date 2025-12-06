import { z } from 'zod';

export const TriggerCreateSchema = z.object({
	name: z.string().min(1).optional(),
	expression: z.string().optional(),
	enabled: z.boolean().optional()
});

export const TriggerUpdateSchema = z.object({
	id: z.string().uuid(),
	name: z.string().optional(),
	expression: z.string().optional(),
	enabled: z.boolean().optional()
});

export type TriggerCreate = z.infer<typeof TriggerCreateSchema>;
export type TriggerUpdate = z.infer<typeof TriggerUpdateSchema>;

export default { TriggerCreateSchema, TriggerUpdateSchema };
