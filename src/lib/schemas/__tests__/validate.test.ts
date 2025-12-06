import { describe, it, expect } from 'vitest';
import { TriggerCreate } from '$lib/schemas/trigger';
import { validateJson, requireValidBody } from '$lib/schemas/validate';

function makeEvent(payload: any) {
	return {
		request: {
			json: async () => payload
		}
	} as any;
}

describe('validateJson / requireValidBody', () => {
	it('validateJson returns ok/data for valid body', async () => {
		const evt = makeEvent({ name: 'good', expression: 'x' });
		const r = await validateJson(evt, TriggerCreate as any);
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.data.name).toBe('good');
	});

	it('validateJson returns error for missing body', async () => {
		const evt = makeEvent(undefined);
		const r = await validateJson(evt, TriggerCreate as any);
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.error).toBeDefined();
	});

	it('requireValidBody returns Response for invalid body', async () => {
		const evt = makeEvent({ name: '', expression: '' });
		const r = await requireValidBody(evt, TriggerCreate as any);
		expect(r instanceof Response).toBe(true);
		if (r instanceof Response) {
			const text = await r.text();
			expect(text).toContain('Invalid input');
		}
	});
});
