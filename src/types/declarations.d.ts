// Ambient module declarations for untyped JS packages used in the project.
declare module 'reflect-metadata';
declare module 'express';
declare module 'compression';
declare module 'express-rate-limit';

// Allow importing CSS/HTML in TS if any build step references them.
declare module '*.css';
declare module '*.html';

// App-level types used by SvelteKit. Adds `locals.user` for server hooks.
import type { User } from '$lib/types/user';

declare namespace App {
	interface Locals {
		user: User | null;
	}

	interface PageData {}
	interface Platform {}
}
