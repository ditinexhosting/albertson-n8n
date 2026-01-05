import { createApp } from 'vue';

import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';
import '@vue-flow/node-resizer/dist/style.css';

import 'vue-json-pretty/lib/styles.css';
import '@n8n/design-system/css/index.scss';
// import '@n8n/design-system/css/tailwind/index.css';

import '@src/main.css';
import './_tokens.scss';
import '@/main.scss';
// Ensure i18n HMR owner is evaluated as early as possible in dev
import '@/app/dev/i18nHmr';

import App from '@src/App.vue';
import router from '@src/router';

import { i18nInstance } from '@n8n/i18n';

import { TelemetryPlugin } from '@/app/plugins/telemetry';
import { GlobalComponentsPlugin } from '@/app/plugins/components';
import { GlobalDirectivesPlugin } from '@/app/plugins/directives';

import { createPinia, PiniaVuePlugin } from 'pinia';
import { ChartJSPlugin } from '@/app/plugins/chartjs';
import { SentryPlugin } from '@/app/plugins/sentry';
import { registerModuleRoutes } from '@/app/moduleInitializer/moduleInitializer';

import type { VueScanOptions } from 'z-vue-scan';

const pinia = createPinia();

const app = createApp(App);

app.use(SentryPlugin);

// Register module routes
// We do this here so landing straight on a module page works
registerModuleRoutes(router);

app.use(TelemetryPlugin);
app.use(PiniaVuePlugin);
app.use(GlobalComponentsPlugin);
app.use(GlobalDirectivesPlugin);
app.use(pinia);
app.use(router);
app.use(i18nInstance);
app.use(ChartJSPlugin);

if (import.meta.env.VUE_SCAN) {
	const { default: VueScan } = await import('z-vue-scan');
	app.use<VueScanOptions>(VueScan, {
		enable: true,
	});
}
window.__pinia = pinia;

app.mount('#app');

if (!import.meta.env.PROD) {
	// Make sure that we get all error messages properly displayed
	// as long as we are not in production mode
	window.onerror = (message, _source, _lineno, _colno, error) => {
		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		if (message.toString().includes('ResizeObserver')) {
			// That error can apparently be ignored and can probably
			// not do anything about it anyway
			return;
		}
		console.error('error caught in main.ts');
		console.error(message);
		console.error(error);
	};
}

const TITLE = 'Albertsons - AI Agentspace';
const FAVICON = '/favicon.png';

const forceTitleAndFavicon = () => {
	if (document.title !== TITLE) {
		document.title = TITLE;
	}
	let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
	if (!link) {
		link = document.createElement('link');
		link.rel = 'icon';
		document.head.appendChild(link);
	}
	if (link.href !== FAVICON) {
		link.href = FAVICON;
	}
};

// Initial call
forceTitleAndFavicon();

function replaceWorkflow(text = '') {
	return text.replace(/\bworkflow(s)?\b/gi, (match, plural) => {
		const isPlural = !!plural;
		const isCapitalized = match[0] === match[0].toUpperCase();

		if (isPlural) {
			return isCapitalized ? 'Agents' : 'agents';
		}
		return isCapitalized ? 'Agent' : 'agent';
	});
}

function replaceWorkflowText(root = document.body) {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);

	let node;
	while ((node = walker.nextNode())) {
		const updated = replaceWorkflow(node.nodeValue);
		if (updated !== node.nodeValue) {
			node.nodeValue = updated;
		}
	}
}

const observer = new MutationObserver(() => {
	replaceWorkflowText();
});

observer.observe(document.body, {
	childList: true,
	subtree: true,
});

// Initial run
replaceWorkflowText();

// Watch for title changes
new MutationObserver(forceTitleAndFavicon).observe(document.querySelector('title')!, {
	childList: true,
});
setInterval(forceTitleAndFavicon, 100);
