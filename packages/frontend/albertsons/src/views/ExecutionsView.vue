<script lang="ts" setup>
import { ref, onMounted, watch, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from '@/app/composables/useToast';
import { albertsonsRestApiRequest } from '@src/utils/albertsonsRestApiRequest';
import { VIEWS } from '@/app/constants';
import { useUsersStore } from '@/features/settings/users/users.store';
import { NButton, NDataTable, NInput, NIcon, NTag, type DataTableColumns, NEmpty } from 'naive-ui';
import {
	Search,
	RotateCcw,
	CheckCircle2,
	XCircle,
	Loader2,
	Clock,
	SlidersHorizontal,
} from 'lucide-vue-next';

const usersStore = useUsersStore();

interface ExecutionRow {
	id: string;
	workflowId: string;
	workflowName: string | null;
	projectId: string;
	projectName: string | null;
	status: string;
	mode?: string;
	startedAt: string | null;
	finishedAt?: string | null;
	durationMs?: number;
	retryOf?: string | number | null;
	retrySuccessId?: string | number | null;
}

const toast = useToast();
const router = useRouter();
const route = useRoute();

const execution_type = route?.query?.execution_type as string | undefined;

const search = ref('');
const statusFilter = ref<'all' | 'success' | 'error' | 'running' | 'waiting'>('all');
const isLoading = ref(false);
const executions = ref<ExecutionRow[]>([]);
const total = ref(0);

function statusType(status: string) {
	if (status === 'success') return 'success';
	if (status === 'error') return 'error';
	if (status === 'running') return 'info';
	return 'warning';
}

function statusIcon(status: string) {
	if (status === 'success') return CheckCircle2;
	if (status === 'error') return XCircle;
	if (status === 'running') return Loader2;
	return Clock;
}

const columns: DataTableColumns<ExecutionRow> = [
	{
		title: 'STATUS',
		key: 'status',
		render: (row) => {
			const Icon = statusIcon(row.status);
			return h(
				'span',
				{
					class: [
						'p-1.5! flex items-center justify-center w-[6rem] rounded-md text-[11px]! gap-1!',
						row.status === 'success'
							? 'bg-[var(--color-light-green)]! text-[var(--color--success)]'
							: row.status === 'running'
								? 'bg-[var(--color-light-orange)]! text-[var(--color-warning-orange)]!'
								: row.status === 'error'
									? 'bg-[var(--color-light-danger)]! text-[var(--color--danger)]'
									: '',
					],
				},
				[
					// ✅ ICON
					h(NIcon, { size: 14 }, { default: () => h(Icon) }),

					// ✅ TEXT
					h('span', formatStatus(row.status)),
				],
			);
		},
	},
	{
		title: 'AGENT',
		key: 'agent',
		render: (row) =>
			h(
				'span',
				{
					class: 'agent-text',
					title: row.workflowName || row.workflowId,
					onClick: () => openExecution(row),
				},
				row.workflowName || row.workflowId,
			),
	},
	{
		title: 'PROJECT',
		key: 'project',
		render: (row) => row.projectName ?? '-',
	},
	{
		title: 'TRIGGERED BY',
		key: 'mode',
		render: (row) => formatStatus(row.mode || 'manual'),
	},
	{
		title: 'STARTED',
		key: 'startedAt',
		render: (row) => formatDate(row.startedAt),
	},
	{
		title: 'DURATION',
		key: 'durationMs',
		render: (row) => formatDuration(row.durationMs),
	},
	{
		title: 'RETRIES',
		key: 'retryOf',
		render: (row) => (row.retryOf ? 1 : 0),
	},
];

async function fetchExecutions() {
	try {
		isLoading.value = true;

		const params = new URLSearchParams();

		const ownerId = usersStore.currentUser?.id;
		if (ownerId) {
			params.append('ownerId', ownerId);
		}

		if (search.value) params.append('search', search.value);
		if (statusFilter.value !== 'all') params.append('status', statusFilter.value);

		const endpoint =
			params.toString().length > 0
				? `/v1/executions/list?${params.toString()}`
				: '/v1/executions/list';

		const res = await albertsonsRestApiRequest('GET', endpoint);

		const payload = (res as any).data ?? res;
		const data = payload.data ?? payload;

		const items: ExecutionRow[] = (data.items ?? []).map((row: any) => ({
			id: row.id,
			workflowId: row.workflowId,
			workflowName: row.workflowName,
			projectId: row.projectId,
			projectName: row.projectName,
			status: row.status,
			mode: row.mode,
			startedAt: row.startedAt,
			finishedAt: row.stoppedAt ?? row.finishedAt ?? null,
			durationMs:
				row.durationMs !== undefined && row.durationMs !== null
					? Number(row.durationMs)
					: undefined,
			retryOf: row.retryOf,
			retrySuccessId: row.retrySuccessId,
		}));

		executions.value = items;
		total.value = data.total ?? items.length;
	} catch (error) {
		toast.showError(error, 'Failed to fetch executions');
	} finally {
		isLoading.value = false;
	}
}

function onRefresh() {
	fetchExecutions();
}

function setExecutionFilter(key) {
	statusFilter.value = key;
	router.replace({
		query: { execution_type: key },
	});
}

watch([search, statusFilter], () => {
	fetchExecutions();
});

onMounted(() => {
	statusFilter.value =
		typeof execution_type === 'string' ? (execution_type as typeof statusFilter.value) : 'all';

	fetchExecutions();
});

function openExecution(row: ExecutionRow) {
	router.push({
		name: VIEWS.EXECUTION_PREVIEW,
		params: {
			name: row.workflowId,
			executionId: row.id,
		},
	});
}

function formatStatus(status: string) {
	if (!status) return '-';
	return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDuration(ms?: number) {
	if (ms === undefined || ms === null) return '-';

	const msNum = Number(ms);
	if (isNaN(msNum) || msNum < 0) return '-';

	if (msNum === 0) {
		const execution = executions.value.find((e) => e.durationMs === ms);
		if (execution && (execution.status === 'running' || execution.status === 'waiting')) {
			return '-';
		}
		return '0s';
	}

	if (msNum < 1000) return `${msNum}ms`;

	const seconds = Math.floor(msNum / 1000);
	if (seconds < 60) return `${seconds}s`;

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	if (remainingSeconds > 0) return `${minutes}m ${remainingSeconds}s`;

	return `${minutes}m`;
}

function formatDate(dateString: string | null) {
	if (!dateString) return '–';

	try {
		const date = new Date(dateString);
		const monthNames = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		];
		const month = monthNames[date.getMonth()];
		const day = date.getDate();

		let hours = date.getHours();
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const seconds = date.getSeconds().toString().padStart(2, '0');
		const ampm = hours >= 12 ? 'PM' : 'AM';

		hours = hours % 12;
		hours = hours ? hours : 12;

		return `${month} ${day}, ${hours}:${minutes}:${seconds} ${ampm}`;
	} catch (e) {
		return dateString;
	}
}
</script>

<template>
	<div class="executions-page p-4!">
		<!-- Second row: search + filters + status pills -->
		<div class="flex flex-row gap-4 justify-between items-center mb-4!">
			<div class="flex flex-row gap-4 items-center">
				<n-input
					v-model:value="search"
					class="rounded-md!"
					placeholder="Search executions..."
					clearable
				>
					<template #prefix>
						<n-icon>
							<Search />
						</n-icon>
					</template>
				</n-input>

				<n-button class="rounded-md!" secondary @click="onRefresh">
					<template #icon>
						<n-icon>
							<RotateCcw />
						</n-icon>
					</template>
					Refresh
				</n-button>
			</div>

			<div class="flex flex-row gap-4 items-center">
				<n-button
					v-for="s in ['all', 'success', 'error', 'running', 'waiting']"
					:key="s"
					:type="statusFilter === s ? 'primary' : 'default'"
					@click="setExecutionFilter(s)"
				>
					{{ s === 'all' ? 'All' : formatStatus(s) }}
				</n-button>
			</div>
		</div>

		<div class="overflow-y-scroll h-140">
			<n-data-table :columns="columns" :data="executions" :scroll-x="900">
				<template #empty> <n-empty description="No executions found" /> </template>
			</n-data-table>
		</div>
	</div>
</template>

<style scoped>
.executions-page {
	height: 100%;
	width: 100%;
	box-sizing: border-box;
}
</style>
