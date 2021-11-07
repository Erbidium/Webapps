module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true
	},
	plugins: ['svelte3', 'sonar.js'],
	extends: ['eslint:recommended', 'prettier', 'plugin:sonarjs/recommended'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2021
	},
};
