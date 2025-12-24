<script lang="ts" setup>
import { ref, onMounted, watch, h } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/app/composables/useToast';
import { albertsonsRestApiRequest } from '@src/utils/albertsonsRestApiRequest';
import { VIEWS } from '@/app/constants';
import { useUsersStore } from '@/features/settings/users/users.store';
import { NButton, NDataTable, NInput, NIcon, NTag, type DataTableColumns } from 'naive-ui';
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
		className: 'col-status',
		render: (row) => {
			const Icon = statusIcon(row.status);
			return h(
				NTag,
				{
					type: statusType(row.status),
					round: true,
					bordered: true,
					class: ['status-badge', `status-badge--${row.status}`],
				},
				{
					icon: () => h(NIcon, { size: 14, class: 'mr-1' }, { default: () => h(Icon) }),
					default: () => formatStatus(row.status),
				},
			);
		},
	},
	{
		title: 'AGENT',
		key: 'agent',
		className: 'col-agent',
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
		className: 'col-project',
		render: () => '–',
	},
	{
		title: 'TRIGGERED BY',
		key: 'mode',
		className: 'col-triggered',
		render: (row) => formatStatus(row.mode || 'manual'),
	},
	{
		title: 'STARTED',
		key: 'startedAt',
		className: 'col-started',
		render: (row) => formatDate(row.startedAt),
	},
	{
		title: 'DURATION',
		key: 'durationMs',
		className: 'col-duration',
		render: (row) => formatDuration(row.durationMs),
	},
	{
		title: 'RETRIES',
		key: 'retryOf',
		className: 'col-retries',
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

watch([search, statusFilter], () => {
	fetchExecutions();
});

onMounted(() => {
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
	<div class="executions-page">
		<!-- Top bar: title + Refresh -->
		<div class="executions-top">
			<div>
				<h2 class="executions-title">Executions</h2>
				<p class="executions-subtitle">Monitor agent execution history</p>
			</div>

			<n-button class="top-refresh" secondary round size="small" @click="onRefresh">
				<template #icon>
					<n-icon>
						<RotateCcw />
					</n-icon>
				</template>
				Refresh
			</n-button>
		</div>

		<!-- Second row: search + filters + status pills -->
		<div class="executions-controls">
			<div class="controls-left">
				<n-input
					v-model:value="search"
					class="exec-search"
					placeholder="Search executions..."
					size="small"
					round
					clearable
				>
					<template #prefix>
						<n-icon>
							<Search />
						</n-icon>
					</template>
				</n-input>

				<n-button class="filters-btn" size="small" secondary>
					<template #icon>
						<n-icon>
							<SlidersHorizontal />
						</n-icon>
					</template>
					Filters
				</n-button>
			</div>

			<div class="controls-right">
				<div class="status-pills">
					<button
						v-for="s in ['all', 'success', 'error', 'running', 'waiting']"
						:key="s"
						class="status-pill"
						:class="{ 'status-pill--active': statusFilter === s }"
						@click="statusFilter = s as any"
					>
						{{ s === 'all' ? 'All' : formatStatus(s) }}
					</button>
				</div>
			</div>
		</div>

		<div class="table-card">
			<div class="table-container">
				<n-data-table
					:columns="columns"
					:data="executions"
					:loading="isLoading"
					:bordered="false"
					:single-line="false"
					size="small"
					:row-class-name="(row: ExecutionRow) => (row.status === 'error' ? 'row-error' : '')"
				/>
			</div>
		</div>
	</div>
</template>

<style scoped>
.executions-page {
	height: 100%;
	width: 100%;
	box-sizing: border-box;
	padding: 24px 32px 24px;
	background-color: var(--color--background);
}

.executions-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
}

.executions-title {
	margin: 0 0 4px 0;
	font-size: 18px;
	font-weight: 600;
	color: var(--color--text--shade-1);
}

.executions-subtitle {
	margin: 0;
	font-size: 13px;
	color: var(--color--text--tint-1);
}

.executions-controls {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
}

.controls-left {
	display: flex;
	align-items: center;
	gap: 8px;
}

.exec-search :deep(.n-input) {
	border-radius: 999px;
	background-color: var(--color--background--light-3);
}

.filters-btn {
	border-radius: var(--radius);
}

.controls-right {
	display: flex;
	align-items: center;
	gap: 8px;
}

.status-pills {
	display: flex;
	gap: 6px;
}

.status-pill {
	padding: 6px 18px;
	border-radius: 999px;
	border: 1px solid var(--border-color--light);
	background-color: var(--color--background--light-3);
	font-size: 14px;
	color: var(--color--text);
	cursor: pointer;
	font-weight: 500;
	line-height: 1;
}

.status-pill--active {
	background-color: var(--color--primary);
	border-color: var(--color--primary);
	color: var(--color--text--tint-3);
}

/* Refresh button: pill, white, light border like wireframe */
.top-refresh {
	border-radius: 999px;
	padding: 0 14px;
	font-weight: 500;
}

.top-refresh :deep(.n-button__border),
.top-refresh :deep(.n-button__state-border) {
	border-color: var(--border-color--light);
}

.top-refresh :deep(.n-button__content) {
	gap: 6px;
	color: var(--color--text--shade-1);
}

.table-card {
	border-radius: var(--radius--lg);
	background-color: var(--color--background--light-3);
	border: 1px solid var(--border-color--light);
	box-shadow: var(--shadow);
	max-height: calc(100vh - 190px);
	display: flex;
	flex-direction: column;
	width: 100%;
	min-width: 100%;
	overflow: hidden;
}

.table-container {
	width: 100%;
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
}

:deep(.n-data-table) {
	--n-border-radius: 0;
	--n-merged-border-color: transparent;
	border-radius: 0;
}

:deep(.n-data-table-wrapper),
:deep(.n-data-table-base-table) {
	border: none;
}

:deep(.n-data-table-th) {
	font-family:
		Inter,
		system-ui,
		-apple-system,
		BlinkMacSystemFont,
		'Segoe UI',
		sans-serif;
	font-weight: 600;
	color: var(--color--text--tint-1);
	text-transform: uppercase;
	font-size: 12px;
	letter-spacing: 0.06em;
	padding: 16px 20px;
	background-color: var(--table--header--color--background);
	border-bottom: 1px solid var(--border-color--light);
	text-align: left;
	white-space: nowrap;
}

:deep(.n-data-table-td) {
	font-family:
		Inter,
		system-ui,
		-apple-system,
		BlinkMacSystemFont,
		'Segoe UI',
		sans-serif;
	color: var(--color--text);
	font-size: 14px;
	font-weight: 400;
	line-height: 1.5;
	padding: 12px 20px;
	border-bottom: 1px solid var(--border-color--light);
	border-right: none;
}

:deep(.n-data-table-tr:hover > .n-data-table-td) {
	background-color: var(--table--row--color--background--hover);
}

.row-error > .n-data-table-td {
	background-color: var(--color--danger--tint-4);
}

.row-error:hover > .n-data-table-td {
	background-color: var(--color--danger--tint-3);
}

:deep(.n-data-table-td.col-agent) {
	max-width: 260px;
}

.agent-text {
	display: inline-block;
	max-width: 260px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	color: var(--color--text--shade-1);
	font-weight: 600;
	cursor: pointer;
}

:deep(.status-badge) {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 4px 12px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 600;
	min-width: 70px;
	text-transform: capitalize;
	border-width: 1px;
}

:deep(.status-badge--success) {
	background-color: var(--color--success--tint-4);
	color: var(--color--success--shade-1);
	border-color: var(--color--success--tint-3);
}

:deep(.status-badge--error) {
	background-color: var(--color--danger--tint-4);
	color: var(--color--danger--shade-1);
	border-color: var(--color--danger--tint-3);
}

:deep(.status-badge--running) {
	background-color: var(--color--primary--tint-3);
	color: var(--color--primary--shade-1);
	border-color: var(--color--primary--tint-2);
}

:deep(.status-badge--waiting) {
	background-color: var(--color--warning--tint-2);
	color: var(--color--warning--shade-1);
	border-color: var(--color--warning--tint-1);
}

:deep(.col-status) {
	width: 10%;
	min-width: 100px;
}

:deep(.col-agent) {
	width: 20%;
	min-width: 160px;
}

:deep(.col-project) {
	width: 15%;
	min-width: 120px;
}

:deep(.col-triggered) {
	width: 15%;
	min-width: 120px;
}

:deep(.col-started) {
	width: 20%;
	min-width: 180px;
}

:deep(.col-duration) {
	width: 10%;
	min-width: 100px;
}

:deep(.col-retries) {
	width: 10%;
	min-width: 80px;
}
</style>
