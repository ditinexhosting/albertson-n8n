<script setup>
import { computed, onMounted, ref, h, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import { useUserAgentMappingsStore } from '@src/stores/userAgentMappings.store';
import { NIcon, NButton, NDataTable, NDropdown, NProgress, NInput, NGradientText } from 'naive-ui';
import { Play, EllipsisVertical, Search, ClockCheck, Pause, Edit, Plus } from 'lucide-vue-next';
import dayjs from 'dayjs';
import { makeRestApiRequest } from '@n8n/rest-api-client';
import { useRootStore } from '@n8n/stores/useRootStore';
import { useToast } from '@/app/composables/useToast';

const router = useRouter();
const toast = useToast();
const searchQuery = ref('');
const userAgentMappingsStore = useUserAgentMappingsStore();

function renderIcon(icon) {
	return () =>
		h(NIcon, null, {
			default: () => h(icon),
		});
}

const options = [
	{
		label: 'Edit Workflow',
		key: 'edit',
		icon: renderIcon(Edit),
	},
];

onMounted(async () => {
	await userAgentMappingsStore.fetchUserAgentMappings();
});

const userAgentMappingsData = computed(() => userAgentMappingsStore.getUserAgentMappings());

const filteredUserAgentMappings = computed(() => {
	return userAgentMappingsData.value.filter((item) =>
		item?.workflow?.name?.toLowerCase().includes(searchQuery?.value?.toLowerCase()),
	);
});
const columns = createColumns();

function goToNewWorkflow() {
	router.push('/workflow/new');
}

function goToEditWorkflow(id) {
	router.push(`/workflow/${id}`);
}

async function runWorkflow(workflow) {
	const rootStore = useRootStore();

	const triggerData = {
		workflowData: toRaw(workflow),
		triggerToStartFrom: { name: workflow?.nodes?.[0]?.name },
	};

	const triggerRes = await makeRestApiRequest(
		rootStore,
		'POST',
		`/rest/workflows/${workflow?.id}/run`,
		triggerData,
	);
	if (triggerRes?.executionId) {
		toast.showMessage({
			title: `Execution`,
			message: `Execution trigger with Id: ${triggerRes?.executionId}`,
			type: 'success',
		});
		router.push(`/workflow/${workflow?.id}/executions/${triggerRes?.executionId}`);
	}
}

const tableHeader = (text) => h('span', { class: 'text-secondary' }, text);
function createColumns() {
	return [
		{
			title: () => tableHeader('NAME'),
			key: 'workflow.name',
			render: (row) =>
				h('span', [
					row.workflow.name,
					h('br'),
					h('small', { class: 'text-secondary' }, `${row.workflow.nodes.length} nodes`),
				]),
		},
		{
			title: () => tableHeader('PROJECT'),
			key: 'workflow.project',
			render: () => {
				return 'Sample Project';
			},
		},
		{
			title: () => tableHeader('STATUS'),
			key: 'workflow.active',
			render: (row) => {
				const isActive = !row?.workflow?.active;

				return h(
					'span',
					{
						class: [
							'p-1.5! flex items-center justify-center w-[4.5rem] rounded-full text-[11px]! gap-1!',
							isActive
								? 'bg-[var(--color-light-green)]! text-[var(--color--success)]'
								: 'bg-[var(--color-light-orange)]! text-[var(--color-warning-orange)]!',
						],
					},
					[
						isActive ? h(ClockCheck, { size: 11 }) : h(Pause, { size: 11 }),
						isActive ? 'Active' : 'Inactive',
					],
				);
			},
		},
		{
			title: () => tableHeader('TRIGGER'),
			key: 'workflow.nodes',
			render: (row) =>
				row?.workflow?.nodes?.[0]?.type
					?.split('.')
					?.pop()
					?.replace(/^\w/, (c) => c.toUpperCase()) || '-',
		},
		{
			title: () => tableHeader('LAST RUN'),
			key: 'last_execution',
			render: (row) =>
				row?.last_execution?.startedAt
					? dayjs(row.last_execution.startedAt).format('MMM DD, hh:mm A')
					: '-',
		},
		{
			title: () => tableHeader('SUCCESS RATE'),
			key: 'success_rate',
			render: (row) =>
				h(
					'div',
					{ class: 'w-4' },
					h(NProgress, {
						type: 'line',
						status: 'success',
						percentage: row.success_rate,
						indicatorPlacement: 'inside',
					}),
				),
		},
		{
			title: ' ',
			key: 'actions',
			render: (row) =>
				h('div', { class: 'flex items-center gap-3 text-gray-400' }, [
					h(Play, {
						class: 'w-4 cursor-pointer',
						onClick: () => runWorkflow(row.workflow),
					}),
					h(
						NDropdown,
						{
							trigger: 'hover',
							options,
							onSelect: () => goToEditWorkflow(row.workflowId),
						},
						{
							default: () => h(EllipsisVertical, { class: 'w-4 cursor-pointer' }),
						},
					),
				]),
		},
	];
}
</script>

<template>
	<div class="p-4! w-full">
		<div class="flex items-center justify-between pb-4!">
			<div class="flex items-start flex-col gap-2">
				<div class="text-2xl font-bold">Agents</div>
				<div class="text-base text-secondary">
					Automate your business processes with intelligent agents
				</div>
			</div>

			<n-button type="primary" @click="goToNewWorkflow"
				><template #icon>
					<NIcon>
						<Plus />
					</NIcon> </template
				>New Agent</n-button
			>
		</div>

		<div class="py-4!">
			<n-input v-model:value="searchQuery" placeholder="Search agents" class="w-64!">
				<template #prefix>
					<n-icon :component="Search" />
				</template>
			</n-input>
			<!-- <button class="filter-btn">
				<Funnel size="12" />
				Filters
			</button> -->
		</div>

		<n-data-table :columns="columns" :data="filteredUserAgentMappings" :scroll-x="900" />
	</div>
</template>
