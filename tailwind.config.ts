import { join } from 'path';
import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import { skeleton } from '@skeletonlabs/tw-plugin';
import daisyui from 'daisyui';

export default {
	//darkMode: 'class',
	darkMode: ['selector', '[data-theme="dark"]'],
	content: ['./src/**/*.{html,js,svelte,ts}',
		join(require.resolve(
			'@skeletonlabs/skeleton'),
			'../**/*.{html,js,svelte,ts}'
		)
	],

	theme: {
		extend: {}
	},

	plugins: [
		typography,
		forms,
		containerQueries,
		skeleton({themes: { preset: [ "skeleton" ] }}),
		require('daisyui'),
	],

	daisyui: {
		themes: ["light", 'dark'],
	}


} satisfies Config;