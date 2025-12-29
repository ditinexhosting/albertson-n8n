<template>
	<div class="p-4! w-full">
		<!-- Strip Container -->
		<n-card :bordered="true" class="mb-4">
			<!-- Page Header -->
			<div class="flex items-center justify-between mb-5">
				<div class="flex items-center gap-3">
					<div class="flex items-center justify-center w-8 h-8 flex-shrink-0">
						<Grid3x3 :size="20" class="text-gray-700" />
					</div>
					<div class="flex flex-col gap-1">
						<div class="text-base font-semibold">Agent Library</div>
						<div class="text-xs text-gray-600">Discover and deploy pre-built automation agents</div>
					</div>
				</div>

				<n-button type="primary" size="small" @click="publishAgent">
					<template #icon>
						<n-icon><Plus /></n-icon>
					</template>
					Publish Agent
				</n-button>
			</div>

			<!-- Search -->
			<div class="mb-5">
				<n-input
					v-model:value="searchQuery"
					placeholder="Search agents..."
					size="small"
					class="w-64!"
				>
					<template #prefix>
						<n-icon :component="Search" />
					</template>
				</n-input>
			</div>

			<!-- Category Tabs -->
			<div class="flex items-center gap-3 border-t border-gray-200 pt-5 -mb-4 -mx-4 px-4">
				<button
					v-for="cat in categories"
					:key="cat.id"
					@click="activeCategory = cat.id"
					class="relative pb-4 text-sm font-medium transition-colors flex items-center gap-1 bg-transparent border-0"
					:class="activeCategory === cat.id ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'"
				>
					{{ cat.label }}
					<ChevronDown v-if="cat.id === 'more'" :size="14" />
					<span
						v-if="activeCategory === cat.id"
						class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
					></span>
				</button>
			</div>
		</n-card>

		<!-- Agent Count -->
		<p class="text-sm text-gray-600 mb-4">{{ filteredPlaceholderAgents.length }} agents</p>

		<!-- Content Area -->
		<div v-if="loading" class="text-center py-16 text-gray-500">Loading agents...</div>

		<div v-else-if="filteredPlaceholderAgents.length === 0" class="text-center py-16 text-gray-500">
			No agents found.
		</div>

		<!-- Agent Cards Grid -->
		<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			<n-card
				v-for="card in filteredPlaceholderAgents"
				:key="card.id"
				:bordered="true"
				hoverable
				class="cursor-pointer transition-all"
				@click="openAgentDetail(card)"
			>
				<template #header>
					<div class="flex items-start justify-between gap-2">
						<h3 class="text-sm font-semibold text-gray-900 leading-tight">
							{{ card.name }}
						</h3>
						<button @click.stop class="text-gray-400 hover:text-gray-600 flex-shrink-0">
							<Info :size="14" />
						</button>
					</div>
				</template>

				<!-- Description -->
				<p class="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
					{{ card.description }}
				</p>

				<!-- Tags -->
				<div class="flex flex-wrap gap-2 mb-4">
					<n-tag :type="getCategoryTagType(card.category)" size="small" round :bordered="false">
						{{ card.category }}
					</n-tag>

					<n-tag v-if="card.badge" type="error" size="small" round :bordered="false">
						<template #icon>
							<span class="inline-block w-1 h-1 rounded-full bg-current mr-1"></span>
						</template>
						{{ card.badge }}
					</n-tag>
				</div>

				<!-- Footer Stats -->
				<template #footer>
					<div class="flex items-center gap-4 text-xs text-gray-500">
						<div class="flex items-center gap-1.5">
							<Play :size="12" />
							<span>{{ card.runs }}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Download :size="12" />
							<span>{{ card.installs }}</span>
						</div>
					</div>
				</template>
			</n-card>
		</div>

		<!-- Agent Detail Modal -->
		<n-modal
			v-model:show="showModal"
			preset="card"
			:style="{ width: '460px', maxWidth: '95vw' }"
			:bordered="false"
			:closable="true"
			:on-close="closeModal"
		>
			<template #header>
				<div class="flex flex-wrap items-center gap-2 mb-2">
					<n-tag type="success" size="small" round :bordered="false">
						{{ selectedAgent?.category }}
					</n-tag>
					<n-tag type="info" size="small" round :bordered="false">
						<template #icon>
							<n-icon :size="12"><CheckCircle2 /></n-icon>
						</template>
						Verified
					</n-tag>
					<span class="text-xs text-gray-500">v2.1.0</span>
				</div>
				<h2 class="text-lg font-semibold text-gray-900">
					{{ selectedAgent?.name }}
				</h2>
			</template>

			<!-- Modal Description -->
			<p class="text-sm text-gray-600 leading-relaxed mb-4">
				This intelligent agent uses machine learning algorithms to analyze historical sales data,
				seasonal trends, and external factors to accurately predict future inventory needs. It
				automatically generates purchase order recommendations and alerts when stock levels are
				predicted to fall below optimal thresholds.
			</p>

			<!-- Stats Row -->
			<div class="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg mb-5">
				<div class="text-center">
					<div class="text-base font-semibold text-gray-900">
						{{ selectedAgent?.statRuns || '45.2K' }}
					</div>
					<div class="text-xs text-gray-500">Total runs</div>
				</div>
				<div class="text-center">
					<div class="text-base font-semibold text-gray-900">
						{{ selectedAgent?.statInstalls || '156' }}
					</div>
					<div class="text-xs text-gray-500">Installs</div>
				</div>
				<div class="text-center">
					<div class="text-base font-semibold text-gray-900">
						{{ selectedAgent?.statSuccess || '99.4%' }}
					</div>
					<div class="text-xs text-gray-500">Success rate</div>
				</div>
			</div>

			<!-- Capabilities -->
			<div class="mb-4">
				<div class="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">
					Capabilities
				</div>
				<div class="grid grid-cols-2 gap-2">
					<n-tag
						v-for="cap in capabilities"
						:key="cap"
						type="success"
						size="small"
						round
						:bordered="false"
					>
						{{ cap }}
					</n-tag>
				</div>
			</div>

			<!-- Integrations -->
			<div class="mb-5">
				<div class="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">
					Integrations
				</div>
				<div class="flex flex-wrap gap-2">
					<n-tag
						v-for="integration in integrations"
						:key="integration"
						size="small"
						round
						:bordered="false"
					>
						{{ integration }}
					</n-tag>
				</div>
			</div>

			<!-- Creator Info -->
			<div class="flex items-center gap-3 pt-4 border-t border-gray-200 mb-5">
				<n-avatar round size="small" color="#18a058">SJ</n-avatar>
				<div>
					<div class="text-sm font-medium text-gray-900">Sarah Johnson</div>
					<div class="text-xs text-gray-500">Engineering</div>
				</div>
			</div>

			<!-- Action Buttons -->
			<template #footer>
				<div class="flex justify-end gap-2">
					<n-button size="small" @click="closeModal">Cancel</n-button>
					<n-button size="small" @click="() => {}">Add to Project</n-button>
					<n-button type="primary" size="small" @click="() => {}">
						<template #icon>
							<n-icon :size="14"><Play /></n-icon>
						</template>
						Use Agent
					</n-button>
				</div>
			</template>
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
	Grid3x3,
} from 'lucide-vue-next';
import { NButton, NInput, NTag, NModal, NCard, NIcon, NAvatar } from 'naive-ui';

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

function getCategoryTagType(
	category: string,
): 'success' | 'info' | 'warning' | 'error' | 'default' {
	const categoryMap: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
		Inventory: 'success',
		Customer: 'info',
		'Supply Chain': 'warning',
		Analytics: 'error',
	};
	return categoryMap[category] || 'default';
}

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
