<template>
	<div class="agent-library-page">
		<!-- White Strip/Card Container -->
		<div class="strip-container">
			<!-- Content Header -->
			<div class="content-header">
				<div class="header-left">
					<div class="icon-title-row">
						<div class="icon-box">
							<!-- Lucide icon instead of inline SVG -->
							<LayoutGrid class="icon" :size="18" />
						</div>
						<div>
							<h2 class="page-title">Agent Library</h2>
							<p class="page-subtitle">Discover and deploy pre-built automation agents</p>
						</div>
					</div>
				</div>

				<!-- Publish Button -->
				<n-button class="btn-publish" type="primary" size="small" @click="publishAgent">
					<template #icon>
						<Plus :size="16" />
					</template>
					Publish Agent
				</n-button>
			</div>

			<!-- Search -->
			<div class="search-container">
				<div class="search-wrapper">
					<div class="search-shell">
						<Search class="search-shell-icon" :size="16" />
						<n-input
							v-model:value="searchQuery"
							size="small"
							class="search-input"
							placeholder="Search agents..."
							clearable
							:bordered="false"
						/>
					</div>
				</div>
			</div>

			<!-- Categories -->
			<div class="categories-container">
				<div class="categories-tabs">
					<n-button
						v-for="cat in categories"
						:key="cat.id"
						quaternary
						class="category-tab"
						:class="{ active: activeCategory === cat.id }"
						@click="activeCategory = cat.id"
					>
						{{ cat.label }}
						<ChevronDown v-if="cat.id === 'more'" :size="14" class="chevron-icon" />
					</n-button>
				</div>
			</div>
		</div>

		<!-- Agent Count (Outside strip) -->
		<p class="agents-count">{{ filteredPlaceholderAgents.length }} agents</p>

		<!-- Content -->
		<main class="content">
			<section v-if="loading" class="empty-section">Loading agents...</section>

			<section v-else-if="filteredPlaceholderAgents.length === 0" class="empty-section">
				No agents found.
			</section>

			<!-- Cards -->
			<section v-else class="agents-grid">
				<article
					v-for="card in filteredPlaceholderAgents"
					:key="card.id"
					class="agent-card design-card"
					@click="openAgentDetail(card)"
				>
					<!-- Header: title + info icon -->
					<div class="agent-card-header">
						<h3 class="agent-card-title">
							{{ card.name }}
						</h3>
						<n-button class="agent-card-icon-btn" text type="default" size="tiny" @click.stop>
							<Info :size="14" class="info-icon" />
						</n-button>
					</div>

					<!-- Description -->
					<p class="agent-card-description design-description">
						{{ card.description }}
					</p>

					<!-- Tags row: category + optional badge -->
					<div class="agent-card-tags design-tags">
						<n-tag
							size="small"
							round
							class="agent-card-category-pill"
							:class="card.categoryClass"
							:bordered="false"
						>
							{{ card.category }}
						</n-tag>

						<n-tag v-if="card.badge" size="small" round class="agent-card-badge" :bordered="false">
							<span class="badge-dot"></span>
							{{ card.badge }}
						</n-tag>
					</div>

					<!-- Footer stats -->
					<div class="agent-card-footer design-footer">
						<div class="footer-item">
							<Play :size="11" />
							<span>{{ card.runs }}</span>
						</div>
						<div class="footer-item">
							<Download :size="11" />
							<span>{{ card.installs }}</span>
						</div>
					</div>
				</article>
			</section>
		</main>

		<!-- Agent Detail Modal (centered like design) -->
		<n-modal
			v-model:show="showModal"
			:mask-closable="true"
			:closable="false"
			transform-origin="center"
		>
			<div class="modal-card">
				<div class="modal-header-row">
					<!-- Tags row -->
					<div class="modal-header-tags">
						<n-tag size="small" round class="modal-tag modal-tag-green" :bordered="false">
							{{ selectedAgent?.category }}
						</n-tag>
						<n-tag size="small" round class="modal-tag modal-tag-blue" :bordered="false">
							<CheckCircle2 class="modal-tag-icon" />
							Verified
						</n-tag>
						<span class="modal-version">v2.1.0</span>
					</div>

					<button class="modal-close-btn" @click="closeModal">✕</button>
				</div>

				<h2 class="modal-title">
					{{ selectedAgent?.name }}
				</h2>

				<p class="modal-description">
					This intelligent agent uses machine learning algorithms to analyze historical sales data,
					seasonal trends, and external factors to accurately predict future inventory needs. It
					automatically generates purchase order recommendations and alerts when stock levels are
					predicted to fall below optimal thresholds.
				</p>

				<!-- Stats row -->
				<div class="modal-stats-row">
					<div class="modal-stat">
						<div class="modal-stat-value">
							{{ selectedAgent?.statRuns || '45.2K' }}
						</div>
						<div class="modal-stat-label">Total runs</div>
					</div>
					<div class="modal-stat">
						<div class="modal-stat-value">
							{{ selectedAgent?.statInstalls || '156' }}
						</div>
						<div class="modal-stat-label">Installs</div>
					</div>
					<div class="modal-stat">
						<div class="modal-stat-value">
							{{ selectedAgent?.statSuccess || '99.4%' }}
						</div>
						<div class="modal-stat-label">Success rate</div>
					</div>
				</div>

				<!-- Capabilities -->
				<div class="modal-section">
					<div class="modal-section-label">Capabilities</div>
					<div class="modal-pill-grid">
						<n-tag
							v-for="cap in capabilities"
							:key="cap"
							size="small"
							round
							:bordered="false"
							class="modal-pill modal-pill-green"
						>
							{{ cap }}
						</n-tag>
					</div>
				</div>

				<!-- Integrations -->
				<div class="modal-section">
					<div class="modal-section-label">Integrations</div>
					<div class="modal-pill-row">
						<n-tag
							v-for="integration in integrations"
							:key="integration"
							size="small"
							round
							:bordered="false"
							class="modal-pill modal-pill-gray"
						>
							{{ integration }}
						</n-tag>
					</div>
				</div>

				<!-- Creator -->
				<div class="modal-creator-row">
					<div class="modal-avatar">SJ</div>
					<div>
						<div class="modal-creator-name">Sarah Johnson</div>
						<div class="modal-creator-role">Engineering</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="modal-actions">
					<n-button class="modal-btn modal-btn-ghost" quaternary @click="closeModal">
						Cancel
					</n-button>
					<n-button class="modal-btn modal-btn-secondary" @click="() => {}">
						Add to Project
					</n-button>
					<n-button type="primary" class="modal-btn modal-btn-primary" @click="() => {}">
						<template #icon>
							<Play :size="14" />
						</template>
						Use Agent
					</n-button>
				</div>
			</div>
		</n-modal>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
	Search,
	Plus,
	Info,
	Play,
	Download,
	ChevronDown,
	CheckCircle2,
	LayoutGrid,
} from 'lucide-vue-next';
import { NButton, NInput, NTag, NModal } from 'naive-ui';

const searchQuery = ref('');
const activeCategory = ref('all');

const showModal = ref(false);
const selectedAgent = ref<any | null>(null);

const loading = ref(false);

const categories = [
	{ id: 'all', label: 'All agents' },
	{ id: 'inventory', label: 'Inventory' },
	{ id: 'customer', label: 'Customer' },
	{ id: 'supply-chain', label: 'Supply Chain' },
	{ id: 'analytics', label: 'Analytics' },
	{ id: 'more', label: 'More' },
];

const placeholderAgents = ref([
	{
		id: 1,
		name: 'Smart Inventory Forecaster',
		description:
			'AI-powered demand forecasting agent that predicts stock levels and generates automatic reorder recommendations.',
		category: 'Inventory',
		categoryClass: 'pill-inventory',
		runs: '45.2K runs',
		installs: '156 installs',
		badge: '',
		statRuns: '45.2K',
		statInstalls: '156',
		statSuccess: '99.4%',
	},
	{
		id: 2,
		name: 'Customer Loyalty Optimizer',
		description:
			'Automatically segments customers and generates personalized offers based on purchase behavior.',
		category: 'Customer',
		categoryClass: 'pill-customer',
		runs: '128.4K runs',
		installs: '203 installs',
		badge: '',
		statRuns: '128.4K',
		statInstalls: '203',
		statSuccess: '98.9%',
	},
	{
		id: 3,
		name: 'Vendor Performance Tracker',
		description:
			'Monitors vendor deliveries, quality metrics, and flags underperforming suppliers.',
		category: 'Supply Chain',
		categoryClass: 'pill-supply',
		runs: '22.9K runs',
		installs: '67 installs',
		badge: '',
		statRuns: '22.9K',
		statInstalls: '67',
		statSuccess: '97.2%',
	},
	{
		id: 4,
		name: 'Real-Time Price Intelligence',
		description:
			'Monitors competitor pricing and market trends to recommend optimal pricing strategies.',
		category: 'Analytics',
		categoryClass: 'pill-analytics',
		runs: '67.8K runs',
		installs: '41 installs',
		badge: 'Requires Approval',
		statRuns: '67.8K',
		statInstalls: '41',
		statSuccess: '96.4%',
	},
]);

const capabilities = ref([
	'Demand Forecasting',
	'Auto Reorder',
	'Trend Analysis',
	'Alert Generation',
]);

const integrations = ref(['SAP', 'Oracle Retail', 'Slack', 'Email']);

const filteredPlaceholderAgents = computed(() => {
	let result = placeholderAgents.value;

	if (activeCategory.value !== 'all') {
		result = result.filter((agent: any) => {
			const raw = agent.category || 'more';
			return raw.toLowerCase().includes(activeCategory.value);
		});
	}

	if (searchQuery.value.trim()) {
		const q = searchQuery.value.toLowerCase();
		result = result.filter(
			(agent: any) =>
				agent.name.toLowerCase().includes(q) || agent.description.toLowerCase().includes(q),
		);
	}

	return result;
});

function publishAgent() {
	console.log('Publish Agent clicked');
}

function openAgentDetail(agent: any) {
	selectedAgent.value = agent;
	showModal.value = true;
}

function closeModal() {
	showModal.value = false;
}
</script>

<style scoped>
* {
	font-family: 'Inter', sans-serif;
}

/* Page background using design system */
.agent-library-page {
	min-height: 100vh;
	background-color: var(--color--background--light-2);
	padding: 24px 32px;
	width: 100%;
	box-sizing: border-box;
}

/* Strip using design system colors */
.strip-container {
	background-color: var(--color--background--light-3);
	border: 1px solid var(--border-color--light);
	border-radius: var(--radius--xl);
	margin-bottom: 20px;
	overflow: hidden;
}

.content-header {
	padding: 18px 24px 10px;
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 24px;
}

.header-left {
	flex: 1;
}

.icon-title-row {
	display: flex;
	align-items: center;
	gap: 10px;
}

.icon-box {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.icon {
	width: 18px;
	height: 18px;
	color: var(--color--text);
}

.page-title {
	font-size: 16px;
	font-weight: 600;
	color: var(--color--text--shade-1);
	margin: 0 0 2px 0;
}

.page-subtitle {
	font-size: 13px;
	color: var(--color--text);
	margin: 0;
}

/* Publish button using design system */
.btn-publish {
	padding: 8px 10px;
	border-radius: var(--radius--lg);
	border: none;
	background-color: var(--color--primary);
	color: var(--button--color--text--primary);
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	gap: 6px;
	white-space: nowrap;
	flex-shrink: 0;
	margin-top: 4px;
}

.btn-publish:hover {
	background-color: var(--color--primary--shade-1);
}

/* Search */
.search-container {
	padding: 0 24px 12px;
}

.search-wrapper {
	max-width: 260px;
}

/* Outer pill container that matches the 2nd image */
.search-shell {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 10px;
	border-radius: var(--radius--lg);
	border: 1px solid var(--border-color--light);
	background-color: var(--color--background--light-2);
}

/* search icon */
.search-shell-icon {
	color: var(--color--text--tint-1);
	flex-shrink: 0;
}

/* make the Naive input look flat inside the shell */
.search-input {
	flex: 1;
}

.search-input :deep(.n-input__input-el) {
	padding: 0;
	border: none;
	box-shadow: none;
	background-color: transparent;
	font-size: 13px;
	color: var(--color--text--shade-1);
}

.search-input :deep(.n-input__placeholder) {
	color: var(--color--text--tint-1);
}

.search-input :deep(.n-input__border),
.search-input :deep(.n-input__state-border) {
	border: none;
}

/* focus ring on the whole shell */
.search-shell:has(input:focus) {
	border-color: var(--color--primary);
	box-shadow: 0 0 0 2px var(--button--outline-color--primary--focus);
}

/* Categories */
.categories-container {
	display: flex;
	align-items: center;
	border-top: 1px solid var(--border-color--light);
	padding: 0 24px;
}

.categories-tabs {
	display: flex;
	gap: 24px;
	flex-wrap: wrap;
}

.category-tab {
	padding: 10px 0 9px;
	border: none;
	background: none;
	color: var(--color--text);
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s ease;
	border-bottom: 2px solid transparent;
	display: flex;
	align-items: center;
	gap: 4px;
	position: relative;
}

.category-tab:hover {
	color: var(--color--text--shade-1);
}

.category-tab.active {
	color: var(--color--primary);
}

.category-tab.active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 2px;
	background-color: var(--color--primary);
}

.chevron-icon {
	color: currentColor;
}

/* Agent Count */
.agents-count {
	font-size: 13px;
	color: var(--color--text);
	margin: 6px 0 16px 4px;
}

/* Content */
.content {
	margin: 0;
}

.empty-section {
	text-align: center;
	padding: 60px 20px;
	font-size: 14px;
	color: var(--color--text);
}

/* Grid: 4 cards per row */
.agents-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 16px;
}

@media (max-width: 1280px) {
	.agents-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
}

@media (max-width: 1024px) {
	.agents-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 640px) {
	.agents-grid {
		grid-template-columns: 1fr;
	}
}

/* Cards */
.agent-card {
	border-radius: var(--radius--xl);
	border: 1px solid var(--border-color--light);
	background-color: var(--color--background--light-3);
	display: flex;
	flex-direction: column;
	cursor: pointer;
}

.design-card {
	padding: 20px 20px 16px;
	box-shadow: var(--shadow--light);
	transition:
		border-color 0.15s ease,
		box-shadow 0.15s ease,
		transform 0.15s ease;
}

.design-card:hover {
	border-color: var(--color--primary);
	box-shadow: var(--shadow);
	transform: translateY(-1px);
}

.agent-card-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 8px;
	margin-bottom: 10px;
}

.agent-card-title {
	font-size: 14px;
	font-weight: 600;
	color: var(--color--text--shade-1);
	margin: 0;
	flex: 1;
	line-height: 1.4;
}

.agent-card-icon-btn {
	border: none;
	background: none;
	cursor: pointer;
	padding: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--color--foreground);
	flex-shrink: 0;
}

.agent-card-icon-btn:hover {
	color: var(--color--text--tint-1);
}

.info-icon {
	color: currentColor;
}

.agent-card-description {
	font-size: 12px;
	color: var(--color--text);
	margin: 0 0 12px 0;
	line-height: 1.5;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.agent-card-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-bottom: 12px;
}

.design-tags .agent-card-category-pill {
	font-size: 11px;
	padding: 4px 10px;
	border-radius: 9999px;
	font-weight: 500;
}

.pill-inventory {
	background-color: var(--color--success--tint-4);
	color: var(--color--success--shade-1);
}

.pill-customer {
	background-color: var(--color--secondary--tint-2);
	color: var(--color--secondary);
}

.pill-supply {
	background-color: var(--color--primary--tint-3);
	color: var(--color--primary--shade-1);
}

.pill-analytics {
	background-color: var(--color--danger--tint-4);
	color: var(--color--danger);
}

.agent-card-badge {
	font-size: 11px;
	padding: 4px 10px;
	border-radius: 9999px;
	font-weight: 500;
	background-color: var(--color--danger--tint-4);
	color: var(--color--danger);
	display: flex;
	align-items: center;
	gap: 4px;
}

.badge-dot {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background-color: currentColor;
}

.agent-card-footer {
	display: flex;
	align-items: center;
	gap: 16px;
	margin-top: auto;
}

.design-footer {
	padding-top: 10px;
	border-top: 1px solid var(--border-color--light);
}

.design-footer .footer-item {
	font-size: 11px;
	color: var(--color--text--tint-1);
	display: flex;
	align-items: center;
	gap: 4px;
}

/* MODAL (Naive UI overlay used, no custom backdrop) */
.modal-card {
	width: 420px;
	max-width: 100%;
	max-height: calc(100vh - 96px);
	background-color: var(--dialog--color--background);
	border-radius: var(--radius--lg);
	box-shadow: var(--shadow--dark);
	padding: 20px 24px 18px;
	overflow-y: auto;
}

/* Modal header */
.modal-header-row {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 12px;
	margin-bottom: 10px;
}

.modal-header-tags {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
}

.modal-tag {
	font-size: 11px;
	padding: 4px 10px;
	border-radius: 9999px;
	font-weight: 500;
	display: inline-flex;
	align-items: center;
	gap: 4px;
}

.modal-tag-green {
	background-color: var(--color--success--tint-4);
	color: var(--color--success--shade-1);
}

.modal-tag-blue {
	background-color: var(--color--primary--tint-3);
	color: var(--color--primary);
}

.modal-tag-icon {
	width: 14px;
	height: 14px;
}

.modal-version {
	font-size: 11px;
	color: var(--color--text--tint-1);
}

.modal-close-btn {
	border: none;
	background: none;
	cursor: pointer;
	color: var(--color--text--tint-1);
	font-size: 16px;
}

.modal-close-btn:hover {
	color: var(--color--text);
}

.modal-title {
	font-size: 18px;
	font-weight: 600;
	color: var(--color--text--shade-1);
	margin: 0 0 8px 0;
}

.modal-description {
	font-size: 13px;
	color: var(--color--text);
	line-height: 1.5;
	margin: 0 0 16px 0;
}

/* Stats row */
.modal-stats-row {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 10px;
	background-color: var(--color--background--light-2);
	border-radius: var(--radius--lg);
	padding: 8px 12px;
	margin-bottom: 16px;
}

.modal-stat {
	text-align: center;
}

.modal-stat-value {
	font-size: 16px;
	font-weight: 600;
	color: var(--color--text--shade-1);
	margin-bottom: 2px;
}

.modal-stat-label {
	font-size: 11px;
	color: var(--color--text);
}

/* Sections */
.modal-section {
	margin-bottom: 14px;
}

.modal-section-label {
	font-size: 11px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: var(--color--text);
	margin-bottom: 6px;
}

.modal-pill-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 6px;
}

.modal-pill-row {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.modal-pill {
	font-size: 12px;
	padding: 4px 10px;
	border-radius: 9999px;
	font-weight: 500;
}

.modal-pill-green {
	background-color: var(--color--success--tint-4);
	color: var(--color--success--shade-1);
}

.modal-pill-gray {
	background-color: var(--color--background--light-2);
	color: var(--color--text);
}

/* Creator */
.modal-creator-row {
	display: flex;
	align-items: center;
	gap: 10px;
	padding-top: 10px;
	border-top: 1px solid var(--border-color--light);
	margin-top: 2px;
}

.modal-avatar {
	width: 34px;
	height: 34px;
	border-radius: 9999px;
	background-color: var(--color--primary);
	color: var(--button--color--text--primary);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 13px;
	font-weight: 600;
}

.modal-creator-name {
	font-size: 13px;
	font-weight: 500;
	color: var(--color--text--shade-1);
}

.modal-creator-role {
	font-size: 11px;
	color: var(--color--text);
}

/* Actions */
.modal-actions {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
	margin-top: 16px;
}

.modal-btn {
	border-radius: var(--radius--lg);
	padding: 8px 14px;
	font-size: 13px;
	font-weight: 500;
	border: 1px solid transparent;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	cursor: pointer;
	transition: all 0.2s ease;
}

.modal-btn-ghost {
	background-color: transparent;
	color: var(--color--text);
	border-color: transparent;
}

.modal-btn-ghost:hover {
	background-color: var(--color--background--light-2);
}

.modal-btn-secondary {
	background-color: var(--button--color--background--secondary);
	color: var(--button--color--text--secondary);
	border-color: var(--button--border-color--secondary);
}

.modal-btn-secondary:hover {
	background-color: var(--button--color--background--secondary--hover);
	border-color: var(--button--border-color--secondary--hover-active-focus);
	color: var(--button--color--text--secondary--hover-active-focus);
}

.modal-btn-primary {
	background-color: var(--color--primary);
	color: var(--button--color--text--primary);
	border-color: var(--color--primary);
}

.modal-btn-primary:hover {
	background-color: var(--color--primary--shade-1);
	border-color: var(--color--primary--shade-1);
}

/* Responsive tweaks */
@media (max-width: 1024px) {
	.agent-library-page {
		padding: 20px 20px;
	}
}

@media (max-width: 640px) {
	.agent-library-page {
		padding: 16px;
	}

	.content-header {
		flex-direction: column;
		align-items: stretch;
	}

	.btn-publish {
		align-self: flex-end;
	}

	.modal-card {
		width: calc(100% - 32px);
	}
}
</style>
