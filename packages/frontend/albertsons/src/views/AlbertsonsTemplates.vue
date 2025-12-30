<template>
	<div class="p-4! w-full h-screen">
		<!-- Strip Container (unchanged) -->
		<n-card :bordered="true" class="rounded-lg!">
			<div class="flex items-center justify-between">
				<div class="flex items-center">
					<LayoutTemplate :size="22" class="text-gray-500 mr-3" />
					<div class="flex flex-col">
						<div class="text-lg font-semibold mb-2">Templates</div>
						<div class="text-sm text-secondary">
							Ready-to-use workflow templates to get you started quickly
						</div>
					</div>
				</div>
			</div>

			<!-- Search -->
			<n-input v-model:value="searchQuery" placeholder="Search templates..." class="w-64! my-4!">
				<template #prefix>
					<n-icon :component="Search" />
				</template>
			</n-input>

			<!-- Category Tabs -->
			<div class="w-max flex items-center gap-3">
				<button
					v-for="cat in categories"
					:key="cat.id"
					@click="activeCategory = cat.id"
					class="cursor-pointer text-sm font-medium transition-colors flex items-center gap-1 bg-transparent border-0"
					:class="
						activeCategory === cat.id ? 'text-primary border-b-2 border-primary' : 'text-secondary'
					"
				>
					{{ cat.label }}
					<ChevronDown v-if="cat.id === 'more'" :size="14" />
				</button>
			</div>
		</n-card>

		<!-- Template Count -->
		<p class="text-sm text-secondary py-3! pl-0.5!">{{ filteredTemplates.length }} templates</p>

		<!-- Empty State -->
		<div
			v-if="filteredTemplates.length === 0"
			class="text-center py-20 text-secondary font-semibold"
		>
			No templates found.
		</div>

		<!-- Template Cards Grid (4 per row) -->
		<div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
			<n-card
				v-for="card in filteredTemplates"
				:key="card.id"
				:bordered="true"
				hoverable
				class="cursor-pointer transition-all rounded-lg!"
				@click="openTemplateDetail(card)"
			>
				<template #header>
					<div>
						<h3 class="text-base font-semibold leading-tight">
							{{ card.name }}
						</h3>
					</div>
				</template>

				<!-- Description -->
				<p class="text-xs text-secondary line-clamp-2">
					{{ card.description }}
				</p>

				<!-- Tags row -->
				<div class="flex flex-wrap gap-2 my-4!">
					<!-- Category pill -->
					<n-tag
						size="small"
						round
						:bordered="false"
						class="font-semibold px-2.5!"
						:type="getCategoryTagType(card.category)"
					>
						{{ card.category }}
					</n-tag>

					<!-- Feature chips: Manual / Schedule / Webhook / Chat / New etc -->
					<n-tag
						v-for="tag in card.tags"
						:key="tag.label"
						size="small"
						round
						:bordered="false"
						class="px-2.5!"
						:type="tag.type"
					>
						<template #icon>
							<n-icon :size="12">
								<component :is="tag.icon" />
							</n-icon>
						</template>
						{{ tag.label }}
					</n-tag>
				</div>

				<!-- Footer Stats -->
				<template #footer>
					<div class="flex items-center gap-4 text-xs text-secondary">
						<div class="flex items-center gap-1.5">
							<Users :size="12" />
							<span>{{ card.uses }} uses</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Workflow :size="12" />
							<span>{{ card.nodes }} nodes</span>
						</div>
					</div>
				</template>
			</n-card>
		</div>

		<!-- Template Detail Modal -->
		<n-modal
			v-model:show="showModal"
			preset="card"
			:style="{ width: '500px', maxWidth: '95vw' }"
			:bordered="false"
			:closable="true"
			:on-close="closeModal"
			class="rounded-lg! px-4!"
		>
			<!-- Chips header -->
			<template #header>
				<div class="flex flex-wrap items-center gap-1">
					<n-tag
						size="small"
						round
						:bordered="false"
						class="font-semibold px-2.5!"
						:type="getCategoryTagType(selectedTemplate?.category || '')"
					>
						{{ selectedTemplate?.category }}
					</n-tag>

					<n-tag
						v-for="tag in selectedTemplate?.tags || []"
						:key="tag.label"
						size="small"
						round
						:bordered="false"
						class="px-2.5!"
						:type="tag.type"
					>
						<template #icon>
							<n-icon :size="12">
								<component :is="tag.icon" />
							</n-icon>
						</template>
						{{ tag.label }}
					</n-tag>
				</div>
			</template>

			<!-- Title -->
			<h2 class="text-lg font-semibold mb-3! mt-2!">
				{{ selectedTemplate?.name }}
			</h2>

			<!-- Description -->
			<p class="text-sm text-secondary leading-relaxed mb-5!">
				{{ selectedTemplate?.fullDescription }}
			</p>

			<!-- Stats row (icons + numbers) -->
			<div class="grid grid-cols-2 gap-2 p-4! bg-gray-100! rounded-lg mb-5!">
				<div class="flex items-center justify-left gap-2">
					<Workflow :size="16" class="text-secondary" />
					<div class="text-left">
						<div class="text-base font-semibold">
							{{ selectedTemplate?.nodes }}
						</div>
						<div class="text-xs text-gray-500">Nodes</div>
					</div>
				</div>
				<div class="flex items-center justify-left gap-2">
					<Users :size="16" class="text-secondary" />
					<div class="text-left">
						<div class="text-base font-semibold">
							{{ selectedTemplate?.uses }}
						</div>
						<div class="text-xs text-gray-500">Uses</div>
					</div>
				</div>
			</div>

			<!-- Setup Steps: gray blocks like wireframe -->
			<div class="mb-5!">
				<div class="text-xs font-semibold uppercase tracking-wide text-secondary mb-3!">
					Setup steps
				</div>
				<div class="flex flex-col gap-2.5">
					<div
						v-for="(step, index) in setupSteps"
						:key="index"
						class="flex items-center gap-3 px-3! py-2.5! rounded-md"
						style="background-color: #f5f5f7"
					>
						<div
							class="flex items-center justify-center w-6 h-6 text-white text-xs font-semibold flex-shrink-0"
							style="background-color: var(--color--primary); border-radius: 999px"
						>
							{{ index + 1 }}
						</div>
						<div class="flex-1">
							<div class="text-sm font-medium">
								{{ step.title }}
							</div>
							<div class="text-xs text-secondary">
								{{ step.description }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Requirements -->
			<div class="mb-4!">
				<div class="text-xs font-semibold uppercase tracking-wide text-secondary mb-3!">
					Requirements
				</div>
				<n-tag type="success" size="small" :bordered="false" class="font-normal p-2!">
					<template #icon>
						<n-icon :size="12"><CheckCircle2 /></n-icon>
					</template>
					{{ selectedTemplate?.requirement || 'No prior experience required' }}
				</n-tag>
			</div>

			<!-- Footer buttons -->
			<template #footer>
				<div class="flex justify-end gap-2">
					<n-button @click="closeModal"> Cancel </n-button>
					<n-button @click="() => {}">
						<template #icon>
							<n-icon :size="14"><FolderPlus /></n-icon>
						</template>
						Add to Project
					</n-button>
					<n-button type="primary" @click="handleUseTemplate">
						<template #icon>
							<n-icon :size="14"><Play /></n-icon>
						</template>
						Use Template
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
	Users,
	Workflow,
	ChevronDown,
	CheckCircle2,
	LayoutTemplate,
	Play,
	FolderPlus,
	Webhook,
	Clock,
	MessageCircle,
	Sparkles,
	Bell,
	BarChart2,
	RefreshCw,
} from 'lucide-vue-next';
import { NButton, NInput, NTag, NModal, NCard, NIcon } from 'naive-ui';

// State
const searchQuery = ref('');
const activeCategory = ref('all');
const showModal = ref(false);
const selectedTemplate = ref<any | null>(null);

// Categories
const categories = [
	{ id: 'all', label: 'All templates' },
	{ id: 'getting-started', label: 'Getting Started' },
	{ id: 'data-sync', label: 'Data Sync' },
	{ id: 'notifications', label: 'Notifications' },
	{ id: 'ai-automation', label: 'AI Automation' },
	{ id: 'more', label: 'More' },
];

// Setup steps
const setupSteps = [
	{
		title: 'Set up the trigger',
		description: 'Configure when your workflow should run',
	},
	{
		title: 'Add processing logic',
		description: 'Connect nodes and define how data flows',
	},
	{
		title: 'Test and activate',
		description: 'Run your workflow and review the results',
	},
];

// Templates (category + one chip)
const templates = ref([
	{
		id: 1,
		name: 'Hello World Workflow',
		description:
			'Your first workflow – learn the basics of creating and running agents in AgentSpace.',
		category: 'Getting Started',
		uses: '2.8K',
		nodes: 3,
		fullDescription:
			"This template is perfect for beginners who want to understand how AgentSpace works. You'll create a simple workflow that runs, processes data ",
		requirement: 'No prior experience required',
		tags: [{ label: 'Manual', icon: Clock, type: 'default' }],
	},
	{
		id: 2,
		name: 'Slack Notification Bot',
		description: 'Send automated notifications to Slack channels when important events occur.',
		category: 'Notifications',
		uses: '1.9K',
		nodes: 4,
		fullDescription:
			'Automatically post messages into Slack when key events happen in your systems. Configure channels, formatting and delivery rules.',
		requirement: 'Slack workspace access',
		tags: [{ label: 'Webhook', icon: Webhook, type: 'info' }],
	},
	{
		id: 3,
		name: 'Daily Sales Report',
		description: 'Automatically generate and distribute daily sales summaries to stakeholders.',
		category: 'Reporting',
		uses: '1.2K',
		nodes: 8,
		fullDescription:
			'Collect sales data, calculate KPIs and email a daily digest to your team. Great for monitoring performance trends.',
		requirement: 'Analytics or database access',
		tags: [{ label: 'Schedule', icon: Clock, type: 'warning' }],
	},
	{
		id: 4,
		name: 'Google Sheets Sync',
		description: 'Two-way synchronization between your data and Google Sheets.',
		category: 'Data Sync',
		uses: '1.6K',
		nodes: 5,
		fullDescription:
			'Keep Google Sheets and your source of truth aligned by syncing rows on a schedule.',
		requirement: 'Google account',
		tags: [{ label: 'Schedule', icon: Clock, type: 'warning' }],
	},
]);

// Filtered list
const filteredTemplates = computed(() => {
	let result = templates.value;

	if (activeCategory.value !== 'all') {
		result = result.filter((t) => {
			const slug = t.category.toLowerCase().replace(/\s+/g, '-');
			return slug === activeCategory.value;
		});
	}

	if (searchQuery.value.trim()) {
		const q = searchQuery.value.toLowerCase();
		result = result.filter(
			(t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
		);
	}

	return result;
});

// Category color helper
function getCategoryTagType(category: string) {
	const map: Record<string, any> = {
		'Getting Started': 'success',
		'Data Sync': 'info',
		Notifications: 'warning',
		Reporting: 'warning',
		'AI Automation': 'error',
	};
	return map[category] || 'default';
}

// Actions
function openTemplateDetail(template: any) {
	selectedTemplate.value = template;
	showModal.value = true;
}

function closeModal() {
	showModal.value = false;
}

function handleUseTemplate() {
	console.log('Use template:', selectedTemplate.value?.id);
	closeModal();
}
</script>
