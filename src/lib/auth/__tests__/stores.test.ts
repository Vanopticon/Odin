import { describe, it, expect, beforeEach } from 'vitest';
import { currentUser, setCurrentUser } from '$lib/auth/stores';
import { ANONYMOUS_USER } from '$lib/types/user';

describe('auth stores', () => {
    beforeEach(() => {
        // reset to anonymous before each test
        setCurrentUser(null);
    });

    it('currentUser defaults to ANONYMOUS_USER', (done) => {
        const unsub = currentUser.subscribe((v) => {
            expect(v).toEqual(ANONYMOUS_USER);
            unsub();
            done();
        });
    });

    it('setCurrentUser sets user correctly', (done) => {
        const testUser = { id: 'u1', username: 'tester', roles: ['user'], permissions: ['read:reports'] };
        const unsub = currentUser.subscribe((v) => {
            if (v && (v as any).username === 'tester') {
                expect(v).toEqual(testUser);
                unsub();
                done();
            }
        });

        setCurrentUser(testUser as any);
    });

    it('setCurrentUser(null) resets to ANONYMOUS_USER', (done) => {
        setCurrentUser({ id: 'x', username: 'foo' } as any);
        const unsub = currentUser.subscribe((v) => {
            if (v && (v as any).username === 'foo') {
                // now reset
                setCurrentUser(null);
            }
            if (v && (v as any).username === ANONYMOUS_USER.username) {
                expect(v).toEqual(ANONYMOUS_USER);
                unsub();
                done();
            }
        });
    });
});
