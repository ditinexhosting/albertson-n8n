<template>
	<!-- Page shell -->
	<div class="dashboard-scroll-container flex flex-1 p-4! flex-col gap-4">
		<!-- METRICS STRIP: white container with ONLY metric cards -->
		<div class="metrics-strip p-4! rounded-md">
			<n-grid :cols="4" :x-gap="14" :y-gap="14">
				<!-- Other metrics -->
				<n-gi v-for="card in metricCards" :key="card.key">
					<div
						class="metric-card compact-card cursor-pointer rounded-md"
						@click="onMetricCardClick(card.key)"
					>
						<div class="compact-header">
							<span class="card-label">
								{{ card.label }}
							</span>
							<div class="mini-chart">
								<div
									v-for="(h, idx) in card.bars"
									:key="idx"
									class="bar"
									:class="card.colorClass"
									:style="{ height: h + '%' }"
								/>
							</div>
						</div>
						<div class="compact-value">
							{{ card.value }}
						</div>
						<div class="compact-change" :class="card.positive ? 'positive' : 'negative'">
							<ArrowUpRight v-if="card.positive" class="change-icon" />
							<ArrowDownRight v-else class="change-icon" />
							{{ card.delta }}
						</div>
					</div>
				</n-gi>
			</n-grid>
		</div>

		<!-- ACTION BUTTONS: outside metrics strip, unchanged -->
		<div class="max-w-350 mx-auto w-full">
			<div class="flex flex-row gap-4">
				<n-button class="rounded-md!" type="primary" @click="goToNewWorkflow"
					><template #icon>
						<NIcon>
							<Plus />
						</NIcon> </template
					>Create Agent</n-button
				>
				<n-button class="rounded-md!" type="default" @click="goToExecutions"
					><template #icon>
						<NIcon>
							<Play class="btn-icon btn-icon-outline" />
						</NIcon> </template
					>View Executions</n-button
				>
				<n-button class="rounded-md!" type="default" @click="goToProjects"
					><template #icon>
						<NIcon>
							<Zap class="btn-icon" />
						</NIcon> </template
					>Projects</n-button
				>
			</div>
		</div>

		<!-- SCROLLABLE MAIN GRID -->
		<div class="w-full max-w-[1400px] mx-auto" style="padding-bottom: 260px">
			<n-grid :cols="24" :x-gap="20" :y-gap="20">
				<!-- LEFT COLUMN -->
				<n-gi :span="16">
					<div class="left-column">
						<!-- NEEDS ATTENTION -->
						<div class="flex flex-row justify-between gap-4">
							<n-card title="Templates" class="rounded-md! box-shadow flex-1">
								<template #header-extra>
									<n-badge :value="templates.length" color="#01529f" />
								</template>
								<template v-if="templates.length > 0">
									<h3 class="text-base font-semibold leading-tight truncate mb-4!">
										{{ templates[0].name }}
									</h3>
									<!-- Description -->
									<p class="text-xs text-secondary line-clamp-2">
										{{ templates[0].description }}
									</p>
								</template>
								<template v-if="templates.length > 0" #footer>
									<div class="flex items-center gap-4 text-xs text-secondary">
										<div class="flex items-center gap-1.5">
											<Users :size="12" />
											<span>{{ templates[0].uses }} uses</span>
										</div>
										<div class="flex items-center gap-1.5">
											<Workflow :size="12" />
											<span>{{ templates[0].nodes }} nodes</span>
										</div>
									</div>
								</template>
								<template #action>
									<span
										class="text-primary text-bold hover:text-primary/30 cursor-pointer"
										@click="goToTemplates"
										>View all</span
									>
								</template>
							</n-card>
							<n-card title="Agent Library" class="rounded-md! box-shadow flex-1">
								<template #header-extra>
									<n-badge :value="agentLibraries.length" color="#01529f" />
								</template>
								<template v-if="agentLibraries.length > 0">
									<h3 class="text-base font-semibold leading-tight truncate mb-4!">
										{{ agentLibraries[0].agent?.name }}
									</h3>
									<p class="text-xs text-secondary line-clamp-2">
										{{ agentLibraries[0].agent?.description }}
									</p>
								</template>
								<template v-if="agentLibraries.length > 0" #footer>
									<div class="flex items-center gap-4 text-xs text-secondary">
										<div class="flex items-center gap-1.5">
											<Play :size="12" />
											<span>{{ agentLibraries[0].total_runs }}</span>
										</div>
										<div class="flex items-center gap-1.5">
											<Download :size="12" />
											<span>{{ agentLibraries[0].installs }}</span>
										</div>
									</div>
								</template>
								<template #action>
									<span
										class="text-primary text-bold hover:text-primary/30 cursor-pointer"
										@click="goToAgentLibrary"
										>View all</span
									>
								</template>
							</n-card>
						</div>
						<!-- ACTIVITY STREAM -->
						<n-card size="small" class="activity-section rounded-md!">
							<div class="activity-header">
								<div class="activity-title">
									<span class="live-dot"></span>
									<span class="live-text">LIVE</span>
									Activity Stream
								</div>
								<button @click="goToAgents" class="view-all">
									View all
									<ChevronRight class="view-all-icon" />
								</button>
							</div>

							<div class="activity-list">
								<div v-if="loading" class="activity-placeholder">
									<div class="placeholder-icon">⏳</div>
									<div class="placeholder-text">Loading activities...</div>
								</div>

								<div
									v-else
									v-for="activity in activities"
									:key="activity.id"
									class="activity-item"
									:class="{ clickable: activity.id !== 'placeholder-1' }"
									@click="activity.id !== 'placeholder-1' && openWorkflow(activity.id)"
								>
									<div class="activity-icon" :class="activity.type"></div>

									<div class="activity-info">
										<div class="activity-name">
											{{ activity.title }}
										</div>
										<div class="activity-desc">
											{{ activity.subtitle }}
										</div>
									</div>

									<div class="activity-time">
										<div class="time-date">
											{{ activity.date }}
										</div>
										<div v-if="activity.time" class="time-duration">
											{{ activity.time }}
										</div>
									</div>
								</div>
							</div>
						</n-card>
					</div>
				</n-gi>

				<!-- RIGHT COLUMN -->
				<n-gi :span="8">
					<div class="right-column">
						<!-- MVP AGENTS -->
						<n-card size="small" class="mvp-card rounded-md!">
							<div class="mvp-header">
								<div class="mvp-title">
									<Trophy class="mvp-trophy" />
									MVP Agents
								</div>
							</div>

							<div class="mvp-divider"></div>

							<div class="mvp-list">
								<div v-if="agentsLoading && !mvpAgents.length" class="state">Loading agents...</div>

								<div v-else-if="!agentsLoading && !mvpAgents.length" class="state">
									MVP agents coming soon.
								</div>

								<div v-else v-for="agent in mvpAgents" :key="agent.id" class="mvp-item">
									<div class="mvp-rank" :class="'mvp-rank-' + agent.rank">
										{{ agent.rank }}
									</div>

									<div class="mvp-main">
										<div class="mvp-name">
											{{ agent.name }}
										</div>
										<div class="mvp-metrics">
											<span>{{ agent.runs }} runs</span>
											<span class="mvp-sr"> {{ agent.successRate.toFixed(1) }}% SR </span>
										</div>
									</div>

									<div class="mvp-right">
										<ArrowUpRight class="mvp-trend-arrow" />
									</div>
								</div>
							</div>

							<!-- <button class="mvp-footer-link">View all agents</button> -->
						</n-card>

						<!-- 7‑DAY TREND -->
						<n-card size="small" class="trend-card rounded-md!">
							<div class="trend-header">
								<div class="trend-title">7-Day Trend</div>
							</div>

							<div class="trend-body">
								<div class="trend-legend">
									<span class="legend-item">
										<span class="legend-dot success-dot"></span>
										Success
									</span>
									<span class="legend-item">
										<span class="legend-dot failure-dot"></span>
										Failures
									</span>
								</div>

								<div class="trend-chart">
									<div v-for="(day, idx) in trendData" :key="idx" class="trend-column">
										<div class="trend-bars">
											<div class="trend-bar success" :style="{ height: day.success + '%' }"></div>
											<div class="trend-bar failure" :style="{ height: day.failure + '%' }"></div>
										</div>
										<div class="trend-label">
											{{ day.label }}
										</div>
									</div>
								</div>
							</div>
						</n-card>
					</div>
				</n-gi>
			</n-grid>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { NGrid, NGi, NCard, NTag, NButton, NBadge } from 'naive-ui';
import {
	CheckCircle2,
	Clock,
	AlertTriangle,
	XCircle,
	ArrowUpRight,
	ArrowDownRight,
	ChevronRight,
	Trophy,
	Plus,
	Play,
	Zap,
	Users,
	Workflow,
	Download,
} from 'lucide-vue-next';
import { useWorkflowsStore } from '@/app/stores/workflows.store';
import { useTemplatesStore } from '../stores/templates.store';
import { useUserAgentMappingsStore } from '@src/stores/userAgentMappings.store';
import { albertsonsRestApiRequest } from '@src/utils/albertsonsRestApiRequest';
import { useUsersStore } from '@/features/settings/users/users.store';
import { handleAction } from '@src/utils/handleAction';
import { getAllAgentLibraries } from '@src/services/agents.service';

const usersStore = useUsersStore();

const router = useRouter();
const templates = ref([]);
const agentLibraries = ref([]);
const workflowsStore = useWorkflowsStore();
const templatesStore = useTemplatesStore();
const userAgentMappingsStore = useUserAgentMappingsStore();

/* n8n bindings */
const workflows = computed(() => workflowsStore.allWorkflows);
const loading = computed(() => workflowsStore.isLoading);

async function loadWorkflows() {
	try {
		// Check if the method exists before calling
		if (typeof workflowsStore.fetchWorkflows === 'function') {
			await workflowsStore.fetchWorkflows();
		} else if (typeof workflowsStore.fetchAllWorkflows === 'function') {
			await workflowsStore.fetchAllWorkflows();
		} else {
			console.warn('No fetchWorkflows method found in workflowsStore');
		}
	} catch (e) {
		console.error('Failed to load workflows:', e);
	}
}

function goToNewWorkflow() {
	router.push('/workflow/new');
}

function goToTemplates() {
	router.push('/templates');
}

function goToAgentLibrary() {
	router.push('/agent-library');
}

function goToAgents() {
	router.push({ path: 'agents', query: { active: true } });
}
function goToProjects() {
	router.push('/projects');
}

function goToExecutions(key) {
	const execution_type = key == 'failures' ? 'error' : key == 'success' ? 'success' : 'all';
	router.push({ path: 'executions', query: { execution_type } });
}

function openWorkflow(id) {
	router.push(`/workflow/${id}`);
}

const onMetricCardClick = (key) => {
	if (key == 'agents') goToAgents();
	else goToExecutions(key);
};

/* ACTIVITY STREAM DATA */
const activities = computed(() => {
	if (true) {
		return [
			{
				id: 'placeholder-1',
				type: 'info',
				icon: '📋',
				title: 'No activities yet',
				subtitle: 'Activity Stream is coming soon.',
				date: new Date().toLocaleDateString('en-GB'),
				time: '',
			},
		];
	}

	return workflows.value
		.slice()
		.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
		.slice(0, 4)
		.map((workflow) => {
			const updatedDate = new Date(workflow.updatedAt);
			const createdDate = new Date(workflow.createdAt);
			const isNew = updatedDate - createdDate < 60000;

			return {
				id: workflow.id,
				type: isNew ? 'success' : 'info',
				icon: isNew ? '✨' : '📋',
				title: workflow.name || 'Untitled Workflow',
				subtitle: isNew ? 'Workflow Created' : 'Workflow Updated',
				date: updatedDate.toLocaleDateString('en-GB'),
				time: updatedDate.toLocaleTimeString('en-GB', {
					hour: '2-digit',
					minute: '2-digit',
				}),
			};
		});
});

/* LIVE METRICS WITH REAL EXECUTION DATA */
const metricsLoading = ref(false);
const executionStats = ref({
	success: 0,
	failure: 0,
	total: 0,
	successRate: 0,
});

const metrics = ref({
	systemHealth: 0,
	executions7d: 0,
	executionsDelta: 0,
	successRate: 0,
	successDelta: 0,
	failures7d: 0,
	failuresDelta: 0,
	activeAgents: 0,
	activeAgentsDelta: 0,
});

const fetchAgentLibraries = () =>
	handleAction({
		action: () => getAllAgentLibraries(usersStore.currentUser.id),
		onSuccess: (res) => {
			agentLibraries.value = res || [];
		},
	});

// Fetch templates
async function fetchTemplates() {
	try {
		const response = await albertsonsRestApiRequest('GET', '/v1/templates/all');
		const templatesData = Array.isArray(response) ? response : [];

		templates.value = templatesData.map((template) => {
			const nodeCount = template.nodes?.length || 0;

			// Determine category
			let category = 'Getting Started';
			const name = (template.name || '').toLowerCase();
			const desc = (template.description || '').toLowerCase();
			if (name.includes('sync') || desc.includes('sync')) category = 'Data Sync';
			else if (name.includes('notification') || name.includes('slack') || name.includes('email'))
				category = 'Notifications';
			else if (name.includes('report') || desc.includes('report')) category = 'Reporting';
			else if (name.includes('ai') || name.includes('agent') || desc.includes('ai'))
				category = 'AI Automation';

			// Determine tags
			const tags = [];
			const chatTrigger = template.nodes?.find((n) => n.type?.includes('chatTrigger'));
			const webhookTrigger = template.nodes?.find((n) => n.type?.includes('webhook'));
			const scheduleTrigger = template.nodes?.find(
				(n) => n.type?.includes('schedule') || n.type?.includes('cron'),
			);
			if (chatTrigger) tags.push({ label: 'Chat', icon: MessageCircle, type: 'success' });
			if (webhookTrigger) tags.push({ label: 'Webhook', icon: Webhook, type: 'info' });
			if (scheduleTrigger) tags.push({ label: 'Schedule', icon: Clock, type: 'warning' });
			if (tags.length === 0) tags.push({ label: 'Manual', icon: Clock, type: 'default' });

			return {
				id: template.id,
				name: template.name || 'Untitled Template',
				description: template.description || 'No description available',
				category,
				uses: '0',
				nodes: nodeCount,
				fullDescription: template.description || 'No detailed description available',
				requirement: 'No prior experience required',
				tags,
				workflowId: template.workflowId,
				authorName: template.authorName,
				rawNodes: template.nodes,
				rawConnections: template.connections,
			};
		});
	} catch (error) {
		console.error('Failed to fetch templates:', error);
	} finally {
	}
}

// Fetch execution statistics from your API using the utility function
async function loadExecutionStats() {
	try {
		// Get the current logged-in user id
		const ownerId = usersStore.currentUser?.id;

		if (!ownerId) {
			console.warn('⚠️ No owner ID found, cannot fetch execution stats');
			return null;
		}

		// Build query parameters
		const successParams = new URLSearchParams({
			ownerId: ownerId,
			status: 'success',
		});

		const failureParams = new URLSearchParams({
			ownerId: ownerId,
			status: 'error',
		});

		// Fetch success executions
		const successData = await albertsonsRestApiRequest(
			'GET',
			`/v1/executions/list?${successParams.toString()}`,
		);
		const successCount = successData?.total || 0;

		// Fetch error/failure executions
		const failureData = await albertsonsRestApiRequest(
			'GET',
			`/v1/executions/list?${failureParams.toString()}`,
		);
		const failureCount = failureData?.total || 0;

		// Calculate totals
		const total = successCount + failureCount;
		const successRate = total > 0 ? (successCount / total) * 100 : 0;

		executionStats.value = {
			success: successCount,
			failure: failureCount,
			total,
			successRate,
		};
		return executionStats.value;
	} catch (e) {
		console.error('❌ Failed to load execution stats:', e);
		return null;
	}
}

// Load metrics using only execution data (no agent-metrics endpoint)
async function loadMetrics() {
	try {
		metricsLoading.value = true;

		// Load execution stats from API
		const execStats = await loadExecutionStats();

		if (execStats) {
			// Use real execution data
			metrics.value = {
				systemHealth: 92, // Default value
				executions7d: execStats.total,
				executionsDelta: 0, // We don't have historical data yet
				successRate: execStats.successRate,
				successDelta: 0, // We don't have historical data yet
				failures7d: execStats.failure,
				failuresDelta: 0, // We don't have historical data yet
				activeAgents: workflows.value?.length ?? 0,
				activeAgentsDelta: 0,
			};
		} else {
			// Fallback to default values if API fails
			metrics.value = {
				systemHealth: 92,
				executions7d: 0,
				executionsDelta: 0,
				successRate: 0,
				successDelta: 0,
				failures7d: 0,
				failuresDelta: 0,
				activeAgents: workflows.value?.length ?? 0,
				activeAgentsDelta: 0,
			};
		}

		console.log('📊 Final Metrics:', metrics.value);
	} catch (e) {
		console.error('Failed to load metrics', e);

		// Set default values on error
		metrics.value = {
			systemHealth: 92,
			executions7d: 0,
			executionsDelta: 0,
			successRate: 0,
			successDelta: 0,
			failures7d: 0,
			failuresDelta: 0,
			activeAgents: workflows.value?.length ?? 0,
			activeAgentsDelta: 0,
		};
	} finally {
		metricsLoading.value = false;
	}
}

const metricCards = computed(() => [
	{
		key: 'executions',
		label: 'EXECUTIONS (7D)',
		value: metrics.value.executions7d.toLocaleString(),
		delta: (metrics.value.executionsDelta >= 0 ? '+' : '') + metrics.value.executionsDelta + '%',
		positive: metrics.value.executionsDelta >= 0,
		colorClass: 'bar-blue',
		bars: [40, 60, 80, 50, 90, 70, 100],
	},
	{
		key: 'success',
		label: 'SUCCESS RATE',
		value: `${metrics.value.successRate.toFixed(1)}%`,
		delta: (metrics.value.successDelta >= 0 ? '+' : '') + metrics.value.successDelta + '%',
		positive: metrics.value.successDelta >= 0,
		colorClass: 'bar-green',
		bars: [90, 95, 85, 92, 97, 93, 98],
	},
	{
		key: 'failures',
		label: 'FAILURES (7D)',
		value: metrics.value.failures7d.toLocaleString(),
		delta: (metrics.value.failuresDelta >= 0 ? '+' : '') + metrics.value.failuresDelta + '%',
		positive: metrics.value.failuresDelta < 0,
		colorClass: 'bar-red',
		bars: [70, 50, 90, 60, 40, 55, 45],
	},
	{
		key: 'agents',
		label: 'ACTIVE AGENTS',
		value: String(rawAgents.value?.length ?? 0),
		delta:
			(metrics.value.activeAgentsDelta >= 0 ? '+' : '') + metrics.value.activeAgentsDelta + '%',
		positive: metrics.value.activeAgentsDelta >= 0,
		colorClass: 'bar-indigo',
		bars: [30, 40, 50, 60, 70, 80, 90],
	},
]);

/* MVP AGENTS */
const agentsLoading = ref(false);
const rawAgents = computed(() =>
	userAgentMappingsStore.getUserAgentMappings().filter((i) => i.workflow?.active == true),
);

const normalizedAgents = computed(() =>
	rawAgents.value.map((item) => ({
		id: item.id,
		name: item.workflow?.name ?? 'Unnamed Agent',
		runs: item.executions ?? item.total_executions ?? 0,
		successRate: item.success_rate ?? 0,
	})),
);

const mvpAgents = computed(() =>
	// normalizedAgents.value
	// 	.slice()
	// 	.sort((a, b) => {
	// 		if ((b.successRate ?? 0) === (a.successRate ?? 0)) {
	// 			return (b.runs ?? 0) - (a.runs ?? 0);
	// 		}
	// 		return (b.successRate ?? 0) - (a.successRate ?? 0);
	// 	})
	// 	.slice(0, 5)
	// 	.map((agent, index) => ({
	// 		...agent,
	// 		rank: index + 1,
	// 	})),
	[],
);

/* TREND DATA */
const trendData = [
	{ label: 'Thu', success: 85, failure: 20 },
	{ label: 'Fri', success: 90, failure: 25 },
	{ label: 'Sat', success: 92, failure: 18 },
	{ label: 'Sun', success: 95, failure: 15 },
	{ label: 'Mon', success: 97, failure: 12 },
	{ label: 'Tue', success: 96, failure: 14 },
	{ label: 'Wed', success: 98, failure: 10 },
];

onMounted(async () => {
	await loadWorkflows();
	await loadMetrics();
	fetchTemplates();
	fetchAgentLibraries();

	if (!rawAgents.value?.length) {
		try {
			agentsLoading.value = true;
			await userAgentMappingsStore.fetchUserAgentMappings();
		} catch (e) {
			console.error('Failed to load agents', e);
		} finally {
			agentsLoading.value = false;
		}
	}
});
</script>

<style scoped>
/* Dashboard scroll container */
.dashboard-scroll-container {
	height: 100vh;
	overflow-y: auto;
	overflow-x: hidden;
}

/* Custom scrollbar styling */
.dashboard-scroll-container::-webkit-scrollbar {
	width: 8px;
}

.dashboard-scroll-container::-webkit-scrollbar-track {
	background: transparent;
}

.dashboard-scroll-container::-webkit-scrollbar-thumb {
	background-color: rgba(0, 0, 0, 0.2);
	border-radius: 4px;
}

.dashboard-scroll-container::-webkit-scrollbar-thumb:hover {
	background-color: rgba(0, 0, 0, 0.3);
}

/* Firefox scrollbar */
.dashboard-scroll-container {
	scrollbar-width: thin;
	scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

/* METRICS STRIP CONTAINER */
.metrics-strip {
	background: white;
	border: 1px solid var(--border-color--light);
	box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
	max-width: 1400px;
	margin: 0 auto;
	width: 100%;
}

/* metric cards */
.metric-card {
	border: 1px solid var(--border-color--light);
	box-shadow: none;
	display: flex;
	flex-direction: column;
	justify-content: center;
	min-height: 110px;
	padding: 14px 12px;
	background: transparent;
}

/* shared metric card base */
.metric-card {
	border: 1px solid var(--border-color--light);
	box-shadow: none;
	display: flex;
	flex-direction: column;
	justify-content: center;
	min-height: 96px;
	padding: 14px 16px;
}

/* SYSTEM HEALTH CARD */
.health-card {
	border: 2px solid var(--color--success--tint-2);
	background: var(--color--background--light-3);
	border-radius: 14px;
	min-height: 128px;
	max-height: 128px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding: 14px 8px;
}

.health-value {
	font-size: 40px;
	font-weight: 700;
	color: var(--color--text--shade-1);
	line-height: 1;
	margin-bottom: 4px;
}

.percent {
	font-size: 20px;
}

.health-label {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	font-size: 12px;
	font-weight: 500;
	color: var(--color--text);
	margin-bottom: 6px;
}

.health-icon {
	width: 14px;
	height: 14px;
	color: var(--color--success);
}

.health-status {
	margin: 4px 0;
	padding: 2px 10px;
	background: var(--color--success--tint-4) !important;
	color: var(--color--success--shade-1) !important;
	font-size: 11px;
}

.health-time {
	margin-top: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
	font-size: 10px;
	color: var(--color--text--tint-1);
}

.time-icon {
	width: 12px;
	height: 12px;
}

/* COMPACT METRIC CARDS */
.compact-card {
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.compact-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 6px;
}

.card-label {
	font-size: 10px;
	font-weight: 600;
	letter-spacing: 0.4px;
	text-transform: uppercase;
	color: var(--color--text--tint-1);
}

.mini-chart {
	display: flex;
	align-items: flex-end;
	gap: 2px;
	height: 16px;
}

.bar {
	width: 3px;
	border-radius: 2px;
}

.bar-blue {
	background: var(--color--primary--tint-1);
}
.bar-green {
	background: var(--color--success--tint-1);
}
.bar-red {
	background: var(--color--danger--tint-1);
}
.bar-indigo {
	background: var(--color--secondary--tint-1);
}

.compact-value {
	font-size: 26px;
	font-weight: 700;
	line-height: 1;
	margin-bottom: 2px;
	color: var(--color--text--shade-1);
}

.compact-change {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 11px;
	font-weight: 600;
}

.compact-change.positive {
	color: var(--color--success);
}

.compact-change.negative {
	color: var(--color--danger);
}

.change-icon {
	width: 11px;
	height: 11px;
}

/* ACTION BUTTONS */
.action-btn {
	display: inline-flex;
	align-items: center;
	font-size: 13px;
	font-weight: 600;
	border-radius: 9px;
	padding: 7px 18px;
	cursor: pointer;
}

.btn-icon {
	width: 16px;
	height: 16px;
	margin-right: 10px;
}

.btn-icon-outline {
	stroke-width: 1.6;
}

.action-btn.primary {
	background: var(--color--primary) !important;
	color: var(--button--color--text--primary) !important;
	border-color: var(--color--primary--shade-1, var(--color--primary)) !important;
	box-shadow: 0 4px 10px rgba(1, 82, 159, 0.22);
}

.action-btn.primary:hover {
	background: var(--color--primary--shade-1, var(--color--primary)) !important;
	border-color: var(--color--primary--shade-2, var(--color--primary)) !important;
}

.action-btn.secondary {
	background: var(--color--background--light-3) !important;
	color: var(--color--text--shade-1) !important;
	border-color: var(--border-color--light) !important;
	box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
}

.action-btn.secondary:hover {
	background: var(--color--background--light-2) !important;
}

/* main grid columns */
.left-column,
.right-column {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

/* NEEDS ATTENTION */
.needs-attention {
	background: var(--color--background--light-3) !important;
	border: 1px solid var(--color--danger--tint-1) !important;
}

.needs-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.needs-title {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 13px;
	font-weight: 600;
	color: var(--color--danger);
}
.needs-title-icon {
	width: 16px;
	height: 16px;
}

.needs-count {
	min-width: 22px;
	height: 22px;
	border-radius: 999px;
	background: var(--color--danger);
	color: var(--color--text--tint-3);
	font-size: 11px;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
}

.needs-list {
	margin-top: 8px;
	padding-top: 8px;
	border-top: 1px solid var(--color--danger--tint-1);
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.needs-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 14px;
	border-radius: 14px;
}
.needs-critical {
	background: var(--color--danger--tint-4);
}
.needs-warning {
	background: var(--color--warning--tint-2);
}

.needs-left {
	display: flex;
	align-items: flex-start;
	gap: 10px;
}
.needs-icon {
	width: 28px;
	height: 28px;
	border-radius: 999px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.critical-icon {
	background: var(--color--danger--tint-3);
	color: var(--color--danger--shade-1);
}
.warning-icon {
	background: var(--color--warning--tint-1);
	color: var(--color--warning--shade-1);
}
.needs-inner-icon {
	width: 14px;
	height: 14px;
}

.needs-main {
	display: flex;
	flex-direction: column;
	gap: 2px;
}
.needs-name {
	font-size: 13px;
	font-weight: 600;
	color: var(--color--text--shade-1);
}
.needs-desc {
	font-size: 11px;
	color: var(--color--text);
}
.needs-date-inline {
	font-size: 11px;
	color: var(--color--text--tint-1);
}

.needs-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-size: 11px;
	font-weight: 600;
}
.needs-btn-primary {
	padding-inline: 12px;
}
.needs-arrow {
	width: 10px;
	height: 10px;
}

/* ACTIVITY */
.activity-section {
	background: var(--color--background--light-3) !important;
	border-radius: 16px;
	border: 1px solid var(--border-color--light) !important;
	box-shadow: var(--shadow--light);
	padding: 10px 18px 14px;
}

.activity-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 6px;
	border-bottom: 1px solid var(--border-color--light);
	padding-bottom: 6px;
}

.activity-title {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 14px;
	font-weight: 600;
	color: var(--color--text--shade-1);
}

.live-dot {
	width: 6px;
	height: 6px;
	border-radius: 999px;
	background: var(--color--success);
}
.live-text {
	color: var(--color--success);
	font-size: 10px;
	font-weight: 700;
	letter-spacing: 0.5px;
}

.view-all {
	display: flex;
	align-items: center;
	gap: 4px;
	background: transparent;
	border: none;
	font-size: 12px;
	font-weight: 500;
	color: var(--link--color--secondary);
	cursor: pointer;
}
.view-all:hover {
	color: var(--link--color--secondary--hover);
}
.view-all-icon {
	width: 14px;
	height: 14px;
}

.activity-list {
	display: flex;
	flex-direction: column;
	gap: 4px;
}
.activity-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 6px;
	border-radius: 10px;
}
.activity-item.clickable:hover {
	background: var(--color--background--light-2);
	cursor: pointer;
}

.activity-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 32px 16px;
	text-align: center;
}
.placeholder-icon {
	font-size: 28px;
	margin-bottom: 6px;
	opacity: 0.6;
}
.placeholder-text {
	font-size: 13px;
	color: var(--color--text);
	font-weight: 500;
}

.activity-icon {
	width: 18px;
	height: 18px;
	border-radius: 999px;
	border: 2px solid var(--color--success);
	position: relative;
	flex-shrink: 0;
}
.activity-icon::before {
	content: '';
	position: absolute;
	inset: 4px;
	border-radius: 999px;
	background: var(--color--success);
}
.activity-icon.info {
	border-color: var(--color--secondary);
}
.activity-icon.info::before {
	background: var(--color--secondary);
}

.activity-info {
	flex: 1;
}
.activity-name {
	font-size: 13px;
	font-weight: 600;
	color: var(--color--text--shade-1);
	margin-bottom: 2px;
}
.activity-desc {
	font-size: 12px;
	color: var(--color--text);
}

.activity-time {
	text-align: right;
	flex-shrink: 0;
}
.time-date {
	font-size: 11px;
	color: var(--color--text);
}
.time-duration {
	font-size: 10px;
	color: var(--color--text--tint-1);
	margin-top: 1px;
}

.box-shadow {
	box-shadow: var(--shadow--light);
}

/* MVP CARD */
.mvp-card {
	background: var(--color--background--light-3) !important;
	border-radius: 16px;
	border: 1px solid var(--border-color--light) !important;
	box-shadow: var(--shadow--light);
	padding: 10px 18px 12px;
}

.mvp-header {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	margin-bottom: 4px;
}
.mvp-title {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 13px;
	font-weight: 600;
	color: var(--color--text--shade-1);
}
.mvp-trophy {
	width: 16px;
	height: 16px;
	color: var(--color-warning-orange);
}

.mvp-divider {
	height: 1px;
	background: var(--border-color--light);
	margin: 6px 0 4px;
}

.mvp-list {
	display: flex;
	flex-direction: column;
	gap: 2px;
	margin-bottom: 4px;
}
.mvp-item {
	display: flex;
	align-items: flex-start;
	gap: 10px;
	padding: 6px 2px;
	border-radius: 10px;
}
.mvp-item:hover {
	background: var(--color--background--light-2);
}

.mvp-rank {
	width: 24px;
	height: 24px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	color: #ffffff;
	background: #d1d5db;
}
.mvp-rank-1 {
	background: #fbbf24;
	color: #78350f;
}
.mvp-rank-2 {
	background: #e5e7eb;
	color: #4b5563;
}
.mvp-rank-3 {
	background: #f97316;
	color: #7c2d12;
}
.mvp-rank-4,
.mvp-rank-5 {
	background: #f3f4f6;
	color: #6b7280;
}

.mvp-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 2px;
}
.mvp-name {
	font-size: 13px;
	font-weight: 600;
	color: var(--color--text--shade-1);
}
.mvp-metrics {
	font-size: 11px;
	color: var(--color--text--tint-1);
	display: flex;
	gap: 6px;
}
.mvp-sr {
	color: var(--color--success);
	font-weight: 600;
}

.mvp-right {
	display: flex;
	align-items: center;
	justify-content: center;
	padding-right: 2px;
}
.mvp-trend-arrow {
	width: 14px;
	height: 14px;
	color: var(--color--success);
}

.mvp-footer-link {
	margin-top: 4px;
	align-self: center;
	background: transparent;
	border: none;
	color: var(--link--color--secondary);
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	padding: 6px 0 2px;
}
.mvp-footer-link:hover {
	color: var(--link--color--secondary--hover);
	text-decoration: underline;
}

/* TREND CARD */
.trend-card {
	background: var(--color--background--light-3) !important;
	border-radius: 16px;
	border: 1px solid var(--border-color--light) !important;
	box-shadow: var(--shadow--light);
	padding: 12px 18px 14px;
	height: 300px;
}

.trend-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 6px;
}
.trend-title {
	font-size: 13px;
	font-weight: 600;
	color: var(--color--text--shade-1);
}

.trend-body {
	display: flex;
	flex-direction: column;
	gap: 6px;
}
.trend-legend {
	display: flex;
	gap: 16px;
	font-size: 10px;
	color: var(--color--text--tint-1);
}
.legend-item {
	display: flex;
	align-items: center;
	gap: 4px;
}
.legend-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
}
.success-dot {
	background: var(--color--success);
}
.failure-dot {
	background: var(--color--danger);
}

.trend-chart {
	margin-top: 2px;
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	gap: 4px;
	height: 120px;
}
.trend-column {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-end;
	gap: 4px;
	flex: 1;
}
.trend-bars {
	display: flex;
	align-items: flex-end;
	gap: 3px;
	width: 100%;
	justify-content: center;
	height: 100%;
}
.trend-bar {
	width: 6px;
	border-radius: 3px;
}
.trend-bar.success {
	background: var(--color--success--tint-1);
}
.trend-bar.failure {
	background: var(--color--danger--tint-1);
}
.trend-label {
	font-size: 10px;
	color: var(--color--text--tint-1);
}

.state {
	font-size: 12px;
	color: var(--color--text--tint-1);
	padding: 8px 0;
}

@media (max-width: 1200px) {
	.dashboard-inner {
		padding: 0 16px;
	}
}
</style>
