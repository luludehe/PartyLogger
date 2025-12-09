import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user
			? {
					id: locals.user.id,
					username: locals.user.username,
					firstName: locals.user.firstName,
					lastName: locals.user.lastName,
					role: {
						name: locals.user.role.name,
						permissions: locals.user.role.permissions.map((p) => p.name)
					}
				}
			: null
	};
};
