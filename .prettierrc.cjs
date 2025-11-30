module.exports = {
	// Explicitly resolve the plugin so Prettier finds it under pnpm's layout
	plugins: [require.resolve('prettier-plugin-svelte')],
	overrides: [
		{
			files: '*.svelte',
			options: { parser: 'svelte' }
		}
	]
};
