import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import icons from 'unplugin-icons/vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		vueJsx(),
		vueDevTools(),
		icons({
			compiler: 'vue3',
			autoInstall: true,
		}),
	],
	resolve: {
		alias: {
			stream: 'stream-browserify',
			'@src': fileURLToPath(new URL('./src', import.meta.url)),
			// Alias to the original n8n editor UI
			'@': fileURLToPath(new URL('../editor-ui/src', import.meta.url)),
			'@n8n/i18n': fileURLToPath(new URL('../@n8n/i18n/src', import.meta.url)),
			'@n8n/chat': fileURLToPath(new URL('../@n8n/chat/src', import.meta.url)),
			'@n8n/composables': fileURLToPath(new URL('../@n8n/composables/src', import.meta.url)),
			'@n8n/design-system': fileURLToPath(new URL('../@n8n/design-system/src', import.meta.url)),
			'@n8n/rest-api-client': fileURLToPath(
				new URL('../@n8n/rest-api-client/src', import.meta.url),
			),
			'@n8n/stores': fileURLToPath(new URL('../@n8n/stores/src', import.meta.url)),
			'@n8n/storybook': fileURLToPath(new URL('../@n8n/storybook/src', import.meta.url)),
			'virtual:node-popularity-data': fileURLToPath(
				new URL('./empty-popularity.js', import.meta.url),
			),
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: [
					'',
					'@use "@/app/css/_variables.scss" as *;',
					'@use "@n8n/design-system/css/mixins" as mixins;',
				].join('\n'),
			},
		},
	},
});
