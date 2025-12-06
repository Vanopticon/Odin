import { describe, it, expect } from 'vitest';
import { TriggerCreate, TriggerUpdate } from '$lib/schemas/trigger';

describe('Trigger schemas', () => {
	it('valid TriggerCreate passes parsing and supplies default enabled', () => {
		const payload = { name: 'Example Trigger', expression: 'src.ip == 1' };
		const parsed = TriggerCreate.safeParse(payload);
		expect(parsed.success).toBe(true);
		if (parsed.success) {
			expect(parsed.data.name).toBe(payload.name);
			expect(parsed.data.expression).toBe(payload.expression);
			expect(parsed.data.enabled).toBe(true);
		}
	});

	it('invalid TriggerCreate fails on empty fields', () => {
		const payload = { name: '', expression: '' };
		const parsed = TriggerCreate.safeParse(payload);
		expect(parsed.success).toBe(false);
		if (!parsed.success) {
			expect(parsed.error.issues.length).toBeGreaterThan(0);
		}
	});

	it('valid TriggerUpdate with uuid passes', () => {
		const payload = { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Updated' };
		const parsed = TriggerUpdate.safeParse(payload);
		expect(parsed.success).toBe(true);
		if (parsed.success) {
			expect(parsed.data.id).toBe(payload.id);
			expect(parsed.data.name).toBe(payload.name);
		}
	});

	it('invalid TriggerUpdate with bad id fails', () => {
		const payload = { id: 'not-a-uuid' };
		const parsed = TriggerUpdate.safeParse(payload);
		expect(parsed.success).toBe(false);
		if (!parsed.success) {
			expect(parsed.error.issues.length).toBeGreaterThan(0);
		}
	});
});
