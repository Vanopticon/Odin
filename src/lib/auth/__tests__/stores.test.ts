import { describe, it, expect, beforeEach } from 'vitest';
import { currentUser, setCurrentUser } from '$lib/auth/stores';
import { ANONYMOUS_USER } from '$lib/types/user';
import { get } from 'svelte/store';

describe('auth stores', () => {
	beforeEach(() => {
		// reset to anonymous before each test
		setCurrentUser(null);
	});

	it('currentUser defaults to ANONYMOUS_USER', () => {
		const v = get(currentUser);
		expect(v).toEqual(ANONYMOUS_USER);
	});

	it('setCurrentUser sets user correctly', () => {
		const testUser = {
			id: 'u1',
			username: 'tester',
			roles: ['user'],
			permissions: ['read:reports']
		};
		setCurrentUser(testUser as any);
		const v = get(currentUser);
		expect(v).toEqual(testUser as any);
	});

	it('setCurrentUser(null) resets to ANONYMOUS_USER', () => {
		setCurrentUser({ id: 'x', username: 'foo' } as any);
		setCurrentUser(null);
		const v = get(currentUser);
		expect(v).toEqual(ANONYMOUS_USER);
	});
});
