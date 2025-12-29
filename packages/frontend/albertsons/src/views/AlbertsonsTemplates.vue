<template>
	<div class="p-4! w-full">
		<!-- Strip Container -->
		<n-card :bordered="true" class="mb-4" :style="{ borderRadius: 'var(--radius--lg)' }">
			<!-- Page Header -->
			<div class="flex items-start gap-3 mb-6">
				<div class="flex items-center justify-center w-8 h-8 flex-shrink-0">
					<LayoutTemplate :size="24" style="color: var(--color--text)" />
				</div>
				<div class="flex flex-col gap-0">
					<div class="text-xl font-semibold" style="color: var(--color--text--shade-1)">
						Templates
					</div>
					<div class="text-sm" style="color: var(--color--text)">
						Ready-to-use workflow templates to get you started quickly
					</div>
				</div>
			</div>

			<!-- Search -->
			<div class="mb-5">
				<n-input
					v-model:value="searchQuery"
					placeholder="Search templates..."
					size="medium"
					class="w-64!"
					:style="{ borderRadius: 'var(--radius)' }"
				>
					<template #prefix>
						<n-icon :component="Search" />
					</template>
				</n-input>
			</div>

			<!-- Category Tabs -->
			<div class="flex items-center gap-6 -mb-6 -mx-6 px-6">
				<button
					v-for="cat in categories"
					:key="cat.id"
					@click="activeCategory = cat.id"
					class="relative pt-4 pb-4 text-sm font-medium transition-colors flex items-center gap-1 bg-transparent border-0 cursor-pointer whitespace-nowrap"
					:style="
						activeCategory === cat.id
							? 'color: var(--color--primary);'
							: 'color: var(--color--text);'
					"
				>
					{{ cat.label }}
					<ChevronDown v-if="cat.id === 'more'" :size="16" class="ml-0.5" />
					<span
						v-if="activeCategory === cat.id"
						class="absolute bottom-0 left-0 right-0"
						style="height: 2px; background-color: var(--color--primary)"
					></span>
				</button>
			</div>
		</n-card>

		<!-- Template Count -->
		<p class="text-sm mb-4" style="color: var(--color--text)">
			{{ filteredTemplates.length }} templates
		</p>

		<!-- Loading State -->
		<div v-if="loading" class="text-center py-16" style="color: var(--color--text)">
			Loading templates...
		</div>

		<!-- Empty State -->
		<div
			v-else-if="filteredTemplates.length === 0"
			class="text-center py-16"
			style="color: var(--color--text)"
		>
			No templates found.
		</div>

		<!-- Templates Grid with Scrollbar -->
		<div v-else class="overflow-y-auto pr-2" style="max-height: calc(100vh - 380px)">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
				<n-card
					v-for="template in filteredTemplates"
					:key="template.id"
					:bordered="true"
					hoverable
					class="cursor-pointer transition-all"
					:content-style="{ padding: '16px' }"
					:style="{ borderRadius: 'var(--radius--lg)' }"
					@click="openTemplateDetail(template)"
				>
					<!-- Title -->
					<h3
						class="text-sm font-semibold leading-tight mb-2"
						style="color: var(--color--text--shade-1)"
					>
						{{ template.name }}
					</h3>

					<!-- Description -->
					<p
						class="text-xs mb-3 leading-relaxed"
						style="
							color: var(--color--text);
							display: -webkit-box;
							-webkit-line-clamp: 2;
							-webkit-box-orient: vertical;
							overflow: hidden;
						"
					>
						{{ template.description }}
					</p>

					<!-- Tags -->
					<div class="flex flex-wrap gap-2 mb-3">
						<n-tag :type="getCategoryTagType(template.category)" size="small" :bordered="false">
							{{ template.category }}
						</n-tag>

						<n-tag
							v-if="template.triggerType"
							:type="getTriggerTagType(template.triggerType)"
							size="small"
							:bordered="false"
						>
							<template #icon>
								<n-icon :size="12">
									<component :is="getTriggerIcon(template.triggerType)" />
								</n-icon>
							</template>
							{{ template.triggerType }}
						</n-tag>
					</div>

					<!-- Footer Stats -->
					<div class="flex items-center gap-4 text-xs" style="color: var(--color--text--tint-1)">
						<div class="flex items-center gap-1.5">
							<Users :size="12" />
							<span>{{ template.uses }}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Workflow :size="12" />
							<span>{{ template.nodes }}</span>
						</div>
					</div>
				</n-card>
			</div>
		</div>

		<!-- Template Detail Modal -->
		<n-modal
			v-model:show="showModal"
			preset="card"
			:style="{ width: '400px', maxWidth: '95vw', borderRadius: 'var(--radius--lg)' }"
			:bordered="false"
			:closable="true"
			:on-close="closeModal"
			:content-style="{ padding: '24px' }"
		>
			<template #header>
				<div class="flex flex-wrap items-center gap-2 mb-1.5">
					<n-tag
						:type="getCategoryTagType(selectedTemplate?.category || '')"
						size="small"
						:bordered="false"
					>
						{{ selectedTemplate?.category }}
					</n-tag>
					<n-tag
						v-if="selectedTemplate?.triggerType"
						:type="getTriggerTagType(selectedTemplate?.triggerType || '')"
						size="small"
						:bordered="false"
					>
						<template #icon>
							<n-icon :size="12">
								<component :is="getTriggerIcon(selectedTemplate?.triggerType || '')" />
							</n-icon>
						</template>
						{{ selectedTemplate?.triggerType }}
					</n-tag>
				</div>
				<h2 class="text-base font-semibold mb-0" style="color: var(--color--text--shade-1)">
					{{ selectedTemplate?.name }}
				</h2>
			</template>

			<!-- Modal Description -->
			<p class="text-sm leading-normal mb-5" style="color: var(--color--text)">
				{{ selectedTemplate?.fullDescription }}
			</p>

			<!-- Stats Row -->
			<div class="grid grid-cols-2 gap-6 mb-4">
				<div class="text-center">
					<div class="flex items-center justify-center gap-1 mb-1.5">
						<Workflow :size="16" style="color: var(--color--text--tint-1)" />
					</div>
					<div class="text-lg font-semibold mb-0.5" style="color: var(--color--text--shade-1)">
						{{ selectedTemplate?.statsNodes || '3' }}
					</div>
					<div class="text-xs" style="color: var(--color--text--tint-1)">Nodes</div>
				</div>
				<div class="text-center">
					<div class="flex items-center justify-center gap-1 mb-1.5">
						<Users :size="16" style="color: var(--color--text--tint-1)" />
					</div>
					<div class="text-lg font-semibold mb-0.5" style="color: var(--color--text--shade-1)">
						{{ selectedTemplate?.statsUses || '2.8K' }}
					</div>
					<div class="text-xs" style="color: var(--color--text--tint-1)">Uses</div>
				</div>
			</div>

			<!-- Setup Steps -->
			<div class="mb-5">
				<div
					class="text-xs font-semibold uppercase tracking-wide mb-3"
					style="color: var(--color--text--tint-1)"
				>
					Setup Steps
				</div>
				<div class="flex flex-col gap-3">
					<div v-for="(step, index) in setupSteps" :key="index" class="flex items-start gap-2.5">
						<div
							class="flex items-center justify-center w-6 h-6 text-white text-xs font-semibold flex-shrink-0"
							style="background-color: var(--color--primary); border-radius: 50%"
						>
							{{ index + 1 }}
						</div>
						<div class="flex-1">
							<div class="text-sm font-medium mb-0.5" style="color: var(--color--text--shade-1)">
								{{ step.title }}
							</div>
							<div class="text-xs leading-normal" style="color: var(--color--text)">
								{{ step.description }}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Requirements -->
			<div class="mb-5">
				<div
					class="text-xs font-semibold uppercase tracking-wide mb-3"
					style="color: var(--color--text--tint-1)"
				>
					Requirements
				</div>
				<n-tag type="success" size="medium" :bordered="false">
					<template #icon>
						<n-icon :size="14"><CheckCircle2 /></n-icon>
					</template>
					{{ selectedTemplate?.requirement || 'No prior experience required' }}
				</n-tag>
			</div>

			<!-- Action Buttons -->
			<template #footer>
				<div class="flex justify-end gap-2">
					<n-button size="medium" @click="closeModal" :style="{ borderRadius: 'var(--radius)' }"
						>Cancel</n-button
					>
					<n-button size="medium" @click="() => {}" :style="{ borderRadius: 'var(--radius)' }"
						>Add to Project</n-button
					>
					<n-button
						type="primary"
						size="medium"
						@click="handleUseTemplate"
						:style="{ borderRadius: 'var(--radius)' }"
					>
						<template #icon>
							<n-icon :size="16"><Play /></n-icon>
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
	PlayCircle,
	Clock,
	Webhook,
	Sparkles,
} from 'lucide-vue-next';
import { NButton, NInput, NTag, NModal, NCard, NIcon } from 'naive-ui';

// State
const searchQuery = ref('');
const activeCategory = ref('all');
const showModal = ref(false);
const selectedTemplate = ref<any | null>(null);
const loading = ref(false);

// Categories
const categories = [
	{ id: 'all', label: 'All templates' },
	{ id: 'getting-started', label: 'Getting Started' },
	{ id: 'data-sync', label: 'Data Sync' },
	{ id: 'notifications', label: 'Notifications' },
	{ id: 'ai-automation', label: 'AI Automation' },
	{ id: 'more', label: 'More' },
];

// Setup Steps for Modal
const setupSteps = [
	{
		title: 'Set up the trigger',
		description: 'Configure when your workflow should run',
	},
	{
		title: 'Add processing logic',
		description: 'Learn how nodes connect and pass data',
	},
	{
		title: 'Test and activate',
		description: 'Run your first execution and see results',
	},
];

// Placeholder Templates Data
const placeholderTemplates = ref([
	{
		id: 1,
		name: 'Hello World Workflow',
		description:
			'Your first workflow - learn the basics of creating and running agents in AgentSpace.',
		category: 'Getting Started',
		triggerType: 'Manual',
		uses: '2.8K uses',
		nodes: '3 nodes',
		statsNodes: '3',
		statsUses: '2.8K',
		difficulty: 'Beginner',
		fullDescription:
			"This template is perfect for beginners who want to understand how AgentSpace works. You'll learn how to create a simple workflow that triggers on a schedule, processes some data, and sends a notification. By the end, you'll understand the core concepts of nodes, triggers, and execution.",
		requirement: 'No prior experience required',
	},
	{
		id: 2,
		name: 'Slack Notification Bot',
		description: 'Send automated notifications to Slack channels when important events occur.',
		category: 'Notifications',
		triggerType: 'Webhook',
		uses: '1.9K uses',
		nodes: '4 nodes',
		statsNodes: '4',
		statsUses: '1.9K',
		difficulty: 'Beginner',
		fullDescription:
			'Set up automated Slack notifications for important business events. This template shows you how to receive webhooks and send formatted messages to your team.',
		requirement: 'Slack workspace access',
	},
	{
		id: 3,
		name: 'Daily Sales Report',
		description: 'Automatically generate and distribute daily sales summaries to stakeholders.',
		category: 'Reporting',
		triggerType: 'Schedule',
		uses: '1.2K uses',
		nodes: '8 nodes',
		statsNodes: '8',
		statsUses: '1.2K',
		difficulty: 'Intermediate',
		fullDescription:
			'Generate comprehensive daily sales reports and automatically distribute them to your team. Pulls data from multiple sources and creates formatted reports.',
		requirement: 'Database access',
	},
	{
		id: 4,
		name: 'Google Sheets Sync',
		description: 'Two-way data synchronization between your data and Google Sheets.',
		category: 'Data Sync',
		triggerType: 'Schedule',
		uses: '1.6K uses',
		nodes: '5 nodes',
		statsNodes: '5',
		statsUses: '1.6K',
		difficulty: 'Beginner',
		fullDescription:
			'Keep your Google Sheets in sync with your database. Automatically update rows, add new data, and maintain consistency across platforms.',
		requirement: 'Google account',
	},
	{
		id: 5,
		name: 'AI Document Summarizer',
		description: 'Use AI to automatically summarize documents and extract key information.',
		category: 'AI Automation',
		triggerType: 'Manual',
		uses: '892 uses',
		nodes: '6 nodes',
		statsNodes: '6',
		statsUses: '892',
		difficulty: 'Advanced',
		fullDescription:
			'Leverage AI to process and summarize large documents. Extract key points, generate summaries, and organize information automatically.',
		requirement: 'OpenAI API key',
	},
	{
		id: 6,
		name: 'Email to Ticket Converter',
		description: 'Automatically create support tickets from incoming customer emails.',
		category: 'Customer Service',
		triggerType: 'Webhook',
		uses: '1.1K uses',
		nodes: '9 nodes',
		statsNodes: '9',
		statsUses: '1.1K',
		difficulty: 'Intermediate',
		fullDescription:
			'Transform customer emails into structured support tickets. Automatically categorize, prioritize, and assign tickets based on email content.',
		requirement: 'Email system integration',
	},
	{
		id: 7,
		name: 'PDF Invoice Processor',
		description: 'Extract data from PDF invoices and sync to your accounting system.',
		category: 'Document Processing',
		triggerType: 'Webhook',
		uses: '567 uses',
		nodes: '12 nodes',
		statsNodes: '12',
		statsUses: '567',
		difficulty: 'Advanced',
		fullDescription:
			'Automate invoice processing by extracting data from PDFs and syncing it to your accounting software. Handles various invoice formats.',
		requirement: 'PDF parsing library',
	},
	{
		id: 8,
		name: 'REST API Connector',
		description: 'Connect to any REST API and integrate data into your workflows.',
		category: 'Integrations',
		triggerType: 'Manual',
		uses: '2.3K uses',
		nodes: '5 nodes',
		statsNodes: '5',
		statsUses: '2.3K',
		difficulty: 'Intermediate',
		fullDescription:
			'Learn how to connect to external REST APIs and integrate their data into your workflows. Includes authentication and error handling.',
		requirement: 'API credentials',
	},
]);

// Computed: Filtered Templates
const filteredTemplates = computed(() => {
	let result = placeholderTemplates.value;

	// Filter by category
	if (activeCategory.value !== 'all') {
		result = result.filter((template: any) => {
			const categorySlug = template.category?.toLowerCase().replace(/\s+/g, '-') || '';
			return categorySlug === activeCategory.value;
		});
	}

	// Filter by search query
	if (searchQuery.value.trim()) {
		const query = searchQuery.value.toLowerCase();
		result = result.filter(
			(template: any) =>
				template.name?.toLowerCase().includes(query) ||
				template.description?.toLowerCase().includes(query),
		);
	}

	return result;
});

// Helpers: Tag Types
function getCategoryTagType(
	category: string,
): 'success' | 'info' | 'warning' | 'error' | 'default' {
	const categoryMap: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
		'Getting Started': 'success',
		'Data Sync': 'info',
		Notifications: 'warning',
		'AI Automation': 'error',
		Reporting: 'warning',
		'Customer Service': 'error',
		'Document Processing': 'info',
		Integrations: 'default',
	};
	return categoryMap[category] || 'default';
}

function getTriggerTagType(
	triggerType: string,
): 'success' | 'info' | 'warning' | 'error' | 'default' {
	const triggerMap: Record<string, 'success' | 'info' | 'warning'> = {
		Manual: 'default',
		Schedule: 'warning',
		Webhook: 'info',
	};
	return triggerMap[triggerType] || 'default';
}

function getTriggerIcon(triggerType: string) {
	const iconMap: Record<string, any> = {
		Manual: PlayCircle,
		Schedule: Clock,
		Webhook: Webhook,
	};
	return iconMap[triggerType] || PlayCircle;
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
	console.log('Using template:', selectedTemplate.value?.id);
	// Add your routing logic here
	closeModal();
}
</script>
