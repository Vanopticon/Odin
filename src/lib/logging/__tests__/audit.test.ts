import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as audit from '$lib/logging/audit';

describe('audit logger', () => {
	let origLog: any;
	beforeEach(() => {
		vi.resetModules();
		origLog = console.log;
		console.log = vi.fn();
	});

	afterEach(() => {
		console.log = origLog;
	});

	it('emits structured JSON to console', async () => {
		await audit.writeAudit({
			action: 'test:action',
			resource: 'trigger',
			resource_id: 'r1',
			data: { a: 1 }
		});
		expect((console.log as any).mock.calls.length).toBeGreaterThan(0);
		const arg = (console.log as any).mock.calls[0][0];
		expect(typeof arg).toBe('string');
		const parsed = JSON.parse(arg);
		expect(parsed.type).toBe('audit');
		expect(parsed.action).toBe('test:action');
	});
});
