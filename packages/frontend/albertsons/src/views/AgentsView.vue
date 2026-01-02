<script setup>
import { computed, onMounted, ref, h } from 'vue';
import { useRouter } from 'vue-router';
import {
	NIcon,
	NButton,
	NDataTable,
	NDropdown,
	NProgress,
	NInput,
	NEmpty,
	useDialog,
} from 'naive-ui';
import {
	Play,
	EllipsisVertical,
	Search,
	ClockCheck,
	Pause,
	Edit,
	Plus,
	Trash2,
} from 'lucide-vue-next';
import dayjs from 'dayjs';
import { runWorkflow } from '@src/utils/runWorkflow';
import { getProgressStatus } from '@src/utils/helper';
import { handleAction as handleActionAPI } from '@src/utils/handleAction';
import { getAllAgents, deleteAgent } from '@src/services/agents.service';
import { useUsersStore } from '@/features/settings/users/users.store';
import { useToast } from '@/app/composables/useToast';

const router = useRouter();
const usersStore = useUsersStore();
const toast = useToast();
const dialog = useDialog();
const agents = ref([]);
const searchQuery = ref('');

function renderIcon(icon) {
	return () =>
		h(NIcon, null, {
			default: () => h(icon),
		});
}

const options = [
	{
		label: 'Edit',
		key: 'edit',
		icon: renderIcon(Edit),
	},
	{
		label: () => h('span', { class: 'text-danger' }, 'Delete'),
		key: 'delete',
		icon: () => h(Trash2, { class: 'h-4 text-danger' }),
	},
];

onMounted(async () => {
	fetchAllAgents();
});

const fetchAllAgents = () =>
	handleActionAPI({
		action: () => getAllAgents(usersStore.currentUser.id),
		onSuccess: (res) => {
			agents.value = res || [];
		},
	});

const filteredUserAgentMappings = computed(() => {
	return agents.value.filter((item) =>
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
			key: 'project.name',
			render: (row) => row.project?.name ?? '-',
		},
		{
			title: () => tableHeader('STATUS'),
			key: 'workflow.active',
			render: (row) => {
				const isActive = row?.workflow?.active;

				return h(
					'span',
					{
						class: [
							'p-1.5! flex items-center justify-center w-[4.5rem] rounded-md text-[11px]! gap-1!',
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
						status: getProgressStatus(row.success_rate),
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
						onClick: () => runWorkflow(router, row.workflow),
					}),
					h(
						NDropdown,
						{
							trigger: 'click',
							options,
							onSelect: (key) => handleOptionSelect(key, row),
						},
						{
							default: () => h(EllipsisVertical, { class: 'w-4 cursor-pointer' }),
						},
					),
				]),
		},
	];
}

const handleOptionSelect = async (key, row) => {
	try {
		switch (key) {
			case 'edit':
				goToEditWorkflow(row.workflowId);
				break;
			case 'delete':
				handleAgentDeleteConfirm(row);
				break;
			default:
				console.error(`Unknown action key: ${key}`);
		}
	} catch (e) {
		console.error('handle action failed', e);
	}
};

// ------------------- DELETE AGENT -------------------
function handleAgentDeleteConfirm(row) {
	dialog.error({
		title: 'Delete Agent',
		content: 'Are you sure?',
		positiveText: 'Delete',
		negativeText: 'Cancel',
		draggable: true,
		onPositiveClick: () => {
			onDeleteAgent(row.id, row.workflowId);
		},
	});
}

const onDeleteAgent = (agentId, workflowId) =>
	handleActionAPI({
		action: () => deleteAgent(agentId, workflowId),
		onSuccess: () => {
			toast.showMessage({
				title: 'Agent',
				message: 'Agent deleted successfully.',
				type: 'success',
			});
			fetchAllAgents();
		},
		onError: (e) => {
			toast.showMessage({
				title: 'Agent',
				message: e.message || 'Failed to delete agent.',
				type: 'error',
			});
		},
	});
</script>

<template>
	<div class="p-4! w-full">
		<div class="flex items-center justify-between pb-4!">
			<n-input v-model:value="searchQuery" placeholder="Search agents" class="w-64! rounded-md!">
				<template #prefix>
					<n-icon :component="Search" />
				</template>
			</n-input>

			<n-button class="rounded-md!" type="primary" @click="goToNewWorkflow"
				><template #icon>
					<NIcon>
						<Plus />
					</NIcon> </template
				>New Agent</n-button
			>
		</div>
		<div class="overflow-y-scroll h-140">
			<n-data-table :columns="columns" :data="filteredUserAgentMappings" :scroll-x="900">
				<template #empty> <n-empty description="No agents found" /> </template>
			</n-data-table>
		</div>
	</div>
</template>
