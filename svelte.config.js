import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		prerender: {
			entries: [
				'*',
				'/liquid/0dea022a8a25abb128b42b0f8e98532bc8bd74f8a77dc81251afcc13168acef7',
				'/liquid/518c0b351f5731f5d40cf6ad444d1c147eda1cdf8c867185c58a526fb02ad806',
				'/liquid/ce091c998b83c78bb71a632313ba3760f1763d9cfcffae02258ffa9865a37bd2',
			]
		}
	}
};

export default config;
