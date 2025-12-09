// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { User, Role, Permission, Session } from '@prisma/client';

type UserWithRole = User & {
	role: Role & {
		permissions: Permission[];
	};
};

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: UserWithRole | null;
			session: Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
