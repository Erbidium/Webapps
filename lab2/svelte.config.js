import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import { sendMail } from './functions/index.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: adapter({
			// default options are shown
			pages: 'build',
			assets: 'build',
			fallback: null
		}),

		vite: {
			css: {
				preprocessorOptions: {
					scss: {
						additionalData: '@import "src/variables.scss";'
					}
				}
			},
			server: {
				proxy: {
					'/api/sendMail': {
						target: 'http://localhost:5001/lab2-80c36/us-central1/sendMail',
						changeOrigin: true,
						secure: false,
						rewrite: (path) => path.replace(/^\/api/, '')
					}
				}
			}
		}
	},

	preprocess: [
		preprocess({
			scss: {
				prependData: '@import "src/variables.scss";'
			}
		})
	]
};

export default config;
