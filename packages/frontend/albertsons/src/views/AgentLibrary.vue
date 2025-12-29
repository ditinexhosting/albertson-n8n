<template>
	<div class="p-4! w-full h-screen">
		<!-- Strip Container -->
		<n-card :bordered="true" class="rounded-lg!">
			<!-- Page Header -->
			<div class="flex items-center justify-between">
				<div class="flex items-start">
					<Library :size="22" class="text-gray-500 mr-3" />
					<div class="flex flex-col">
						<div class="text-lg font-semibold mb-2">Agent Library</div>
						<div class="text-sm text-secondary">
							Discover and deploy pre-built automation agents
						</div>
					</div>
				</div>

				<n-button type="primary" size="medium" @click="showPublishModal = true">
					<template #icon>
						<n-icon><Plus /></n-icon>
					</template>
					Publish Agent
				</n-button>
			</div>

			<!-- Search -->
			<n-input v-model:value="searchQuery" placeholder="Search agents..." class="w-64! my-6!">
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
					class="text-sm font-medium transition-colors flex items-center gap-1 bg-transparent border-0"
					:class="
						activeCategory === cat.id ? 'text-primary border-b-2 border-primary' : 'text-secondary'
					"
				>
					{{ cat.label }}
					<ChevronDown v-if="cat.id === 'more'" :size="14" />
				</button>
			</div>
		</n-card>

		<!-- Agent Count -->
		<p class="text-sm text-secondary py-3! pl-0.5!">{{ filteredAgents.length }} agents</p>

		<!-- Content Area -->
		<div v-if="loading" class="text-center py-20 text-secondary">Loading agents...</div>

		<div
			v-else-if="filteredAgents.length === 0"
			class="text-center py-20 text-secondary font-semibold"
		>
			No agents found.
		</div>

		<!-- Agent Cards Grid -->
		<div v-else class="flex flex-wrap gap-4 items-start">
			<n-card
				v-for="card in filteredAgents"
				:key="card?.id"
				:bordered="true"
				hoverable
				class="cursor-pointer transition-all flex-[1_1_24rem] max-w-[24rem] rounded-lg!"
				@click="openAgentDetail(card)"
			>
				<template #header>
					<div class="flex items-center justify-between pb-4! border-b! border-border-primary!">
						<h3 class="text-base font-semibold leading-tight">
							{{ card?.agent?.name }}
						</h3>

						<BadgeCheck :size="16" class="text-primary" />
					</div>
				</template>

				<!-- Description -->
				<p class="text-xs text-secondary line-clamp-2">
					{{ card.agent?.description }}
				</p>

				<!-- Tags -->
				<n-tag
					type="primary"
					size="small"
					round
					:bordered="false"
					class="my-4! font-semibold px-2.5!"
				>
					{{ card.category }}
				</n-tag>

				<!-- Footer Stats -->
				<template #footer>
					<div class="flex items-center gap-4 text-xs text-secondary">
						<div class="flex items-center gap-1.5">
							<Play :size="12" />
							<span>{{ card.total_runs }}</span>
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
			class="rounded-lg! px-4!"
		>
			<template #header>
				<div class="flex flex-wrap items-center gap-2">
					<n-tag type="success" size="small" round :bordered="false" class="font-semibold px-2.5!">
						{{ selectedAgent?.category }}
					</n-tag>
					<n-tag type="info" size="small" round :bordered="false" class="font-semibold px-2.5!">
						<template #icon>
							<n-icon :size="12"><CheckCircle2 /></n-icon>
						</template>
						Verified
					</n-tag>
					<span class="text-xs bg-gray-100! p-1! px-2!">v2.1.0</span>
				</div>
			</template>
			<h2 class="text-lg font-bold! mb-3!">
				{{ selectedAgent?.agent?.name }}
			</h2>

			<!-- Modal Description -->
			<p class="text-sm text-secondary leading-relaxed">
				{{ selectedAgent?.agent?.description }}
			</p>

			<!-- Stats Row -->
			<div class="grid grid-cols-3 gap-3 p-3! bg-gray-100! rounded-lg my-5!">
				<div class="text-center">
					<div class="text-base font-semibold">
						{{ selectedAgent?.total_runs }}
					</div>
					<div class="text-xs text-gray-500">Total runs</div>
				</div>
				<div class="text-center">
					<div class="text-base font-semibold">
						{{ selectedAgent?.installs }}
					</div>
					<div class="text-xs text-gray-500">Installs</div>
				</div>
				<div class="text-center">
					<div class="text-base font-semibold">{{ selectedAgent?.success_rate }}%</div>
					<div class="text-xs text-gray-500">Success rate</div>
				</div>
			</div>

			<!-- Capabilities -->
			<div class="mb-4">
				<div class="text-xs font-semibold uppercase tracking-wide text-secondary mb-3!">
					Capabilities
				</div>
				<div class="flex flex-wrap gap-2">
					<n-tag
						v-for="cap in selectedAgent?.capabilities"
						:key="cap"
						type="success"
						size="small"
						:bordered="false"
						class="font-normal p-2!"
					>
						{{ cap }}
					</n-tag>
				</div>
			</div>

			<!-- Integrations -->
			<div class="my-6!">
				<div class="text-xs font-semibold uppercase tracking-wide text-secondary mb-2!">
					Integrations
				</div>
				<div class="flex flex-wrap gap-2">
					<n-tag
						v-for="integration in selectedAgent?.integrations"
						:key="integration"
						size="small"
						:bordered="false"
						class="font-normal p-2.5!"
					>
						{{ integration }}
					</n-tag>
				</div>
			</div>

			<!-- Creator Info -->
			<div class="flex items-center gap-3 p-3! bg-gray-100! rounded-lg my-5!">
				<n-avatar round size="small" color="#01529f">SJ</n-avatar>
				<div>
					<div class="text-sm font-medium">
						{{ selectedAgent?.owner?.firstName + ' ' + selectedAgent?.owner?.lastName }}
					</div>
					<div class="text-xs text-secondary">{{ selectedAgent?.owner?.email }}</div>
				</div>
			</div>

			<!-- Action Buttons -->
			<template #footer>
				<div class="flex justify-end gap-2">
					<n-button @click="closeModal">Cancel</n-button>
					<n-button @click="() => {}">
						<template #icon>
							<n-icon :size="14"><FolderPlus /></n-icon>
						</template>
						Add to Project</n-button
					>
					<n-button type="primary" @click="() => {}">
						<template #icon>
							<n-icon :size="14"><Play /></n-icon>
						</template>
						Use Agent
					</n-button>
				</div>
			</template>
		</n-modal>

		<!-- Publish Agent Modal -->
		<n-modal
			v-model:show="showPublishModal"
			:mask-closable="false"
			preset="card"
			size="huge"
			style="width: 600px"
			class="rounded-lg!"
		>
			<template #header>Publish Agent</template>

			<n-form
				ref="formRef"
				:model="formValue"
				:rules="formRules"
				label-placement="top"
				size="medium"
			>
				<n-grid x-gap="12" :cols="1">
					<n-gi>
						<n-form-item label="Agent" path="agentId">
							<n-select
								filterable
								v-model:value="formValue.agentId"
								:options="availableAgentsToAddInProject"
							/>
						</n-form-item>
					</n-gi>

					<n-gi>
						<n-form-item label="Category" path="category">
							<n-input v-model:value="formValue.category" placeholder="Inventory" />
						</n-form-item>
					</n-gi>

					<n-gi>
						<n-form-item label="Capabilities">
							<n-dynamic-tags v-model:value="formValue.capabilities" />
						</n-form-item>
					</n-gi>

					<n-gi>
						<n-form-item label="Integrations">
							<n-dynamic-tags v-model:value="formValue.integrations" />
						</n-form-item>
					</n-gi>

					<n-gi>
						<n-form-item label="Version" path="version">
							<n-input v-model:value="formValue.version" placeholder="v1.2.0" />
						</n-form-item>
					</n-gi>
				</n-grid>
			</n-form>

			<template #footer>
				<div class="flex gap-4 justify-end">
					<n-button ghost type="primary" @click="showPublishModal = false">Close </n-button>
					<n-button type="primary" :loading="showPublishModal"> Publish </n-button>
				</div>
			</template>
		</n-modal>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useUsersStore } from '@/features/settings/users/users.store';
import { albertsonsRestApiRequest } from '@src/utils/albertsonsRestApiRequest';

import {
	Search,
	Plus,
	Play,
	Download,
	ChevronDown,
	CheckCircle2,
	Library,
	BadgeCheck,
	FolderPlus,
} from 'lucide-vue-next';
import {
	NButton,
	NInput,
	NTag,
	NModal,
	NCard,
	NIcon,
	NAvatar,
	NSelect,
	NGrid,
	NGi,
	NForm,
	NDynamicTags,
	NFormItem,
} from 'naive-ui';

const searchQuery = ref('');
const activeCategory = ref('all');
const showModal = ref(false);
const showPublishModal = ref(false);
const selectedAgent = ref<any | null>(null);
const loading = ref(false);
const usersStore = useUsersStore();
const agentLibraries = ref([]);
const agents = ref([]);

const formValue = ref({
	agentId: '',
	ownerId: usersStore.currentUser?.id,
	category: '',
	capabilities: [],
	integrations: [],
	version: '',
});

const formRules = {
	agentId: {
		required: true,
		message: 'You must select a agent.',
		trigger: ['input', 'blur'],
	},
	category: {
		required: true,
		message: 'Please input category.',
		trigger: ['input', 'blur'],
	},
};

const categories = computed(() => {
	const unique = new Set<string>();

	agentLibraries.value.forEach((agent: any) => {
		if (agent.category) unique.add(agent.category);
	});

	return [
		{ id: 'all', label: 'All agents' },
		...Array.from(unique).map((c) => ({
			id: c.toLowerCase().replace(/\s+/g, '-'),
			label: c,
		})),
		{ id: 'more', label: 'More' },
	];
});

const filteredAgents = computed(() => {
	let result = agentLibraries.value;

	if (activeCategory.value !== 'all') {
		result = result.filter((agent: any) =>
			agent.category?.toLowerCase().replace(/\s+/g, '-').includes(activeCategory.value),
		);
	}

	if (searchQuery.value.trim()) {
		const q = searchQuery.value.toLowerCase();
		result = result.filter((agent: any) => agent.agent?.name?.toLowerCase().includes(q));
	}

	return result;
});

function openAgentDetail(agent: any) {
	selectedAgent.value = agent;
	showModal.value = true;
}

function closeModal() {
	showModal.value = false;
}

// Load initial data
onMounted(async () => {
	try {
		fetchAgentLibraries();
		// fetchAllUsers();
		fetchAllAgents();
	} catch (e) {
		console.error('Failed to load initial api data', e);
	}
});

const availableAgentsToAddInProject = computed(() => {
	console.log('agents', agents.value);
	console.log('agents lib', agentLibraries.value);
	return agents.value
		.filter((agent) => !agentLibraries.value?.some((pagent) => pagent.agentId === agent.workflowId))
		.map((agent) => ({
			label: agent.workflow?.name,
			value: agent.workflow?.id,
		}));
});

const fetchAllAgents = async () => {
	try {
		const apiResult = await albertsonsRestApiRequest('POST', `/v1/my-agents/all`, {
			ownerId: usersStore.currentUser.id,
		});
		if (apiResult.length > 0) {
			agents.value = apiResult;
		}
	} catch (e) {
		console.error('Failed to load initial api data', e);
	}
};

const fetchAgentLibraries = async () => {
	try {
		const apiResult = await albertsonsRestApiRequest(
			'GET',
			`/v1/agent-library/all/${usersStore.currentUser?.id}`,
		);
		if (apiResult.length > 0) {
			agentLibraries.value = apiResult;
		}
	} catch (e) {
		console.error('Failed to load initial api data', e);
	}
};
</script>
