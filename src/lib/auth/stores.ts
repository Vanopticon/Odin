import { writable } from 'svelte/store';
import type { User } from '$lib/types/user';
import { ANONYMOUS_USER } from '$lib/types/user';

/**
 * `currentUser` is a small client-side store representing the authenticated user.
 * It defaults to an anonymous guest user. The server should hydrate this in a real app.
 */
export const currentUser = writable<User | null>(ANONYMOUS_USER);

export function setCurrentUser(u: User | null) {
    currentUser.set(u ?? ANONYMOUS_USER);
}
