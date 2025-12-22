<template>
	<n-layout class="h-screen">
		<n-layout-content class="page-shell">
			<div class="page-inner">
				<div class="dashboard-scroll">
					<div class="dashboard">
						<!-- HEADER -->
						<header class="header">
							<h2 class="page-title">Pulse</h2>

							<div class="search-wrapper">
								<Search class="search-icon" />
								<n-input
									v-model:value="search"
									size="small"
									placeholder="Search workflows, projects..."
									class="search-input"
									clearable
								/>
							</div>

							<div class="header-right">
								<n-badge :value="4" type="info" processing>
									<n-button quaternary circle class="notification-btn">
										<Bell class="notif-icon" />
									</n-button>
								</n-badge>
							</div>
						</header>

						<!-- INNER CONTENT WRAPPER -->
						<div class="dashboard-inner">
							<!-- METRICS STRIP -->
							<div class="metrics-strip">
								<n-grid :cols="5" :x-gap="12" :y-gap="12">
									<!-- System Health -->
									<n-gi>
										<n-card size="small" class="metric-card health-card" embedded>
											<div class="health-value">
												{{ metrics.systemHealth ? metrics.systemHealth : 92
												}}<span class="percent">%</span>
											</div>
											<div class="health-label">
												<CheckCircle2 class="health-icon" />
												<span>System Health</span>
											</div>
											<n-tag size="small" round type="success" class="health-status"> Good </n-tag>
											<div class="health-time">
												<Clock class="time-icon" />
												Updated 2s ago
											</div>
										</n-card>
									</n-gi>

									<!-- Other metrics -->
									<n-gi v-for="card in metricCards" :key="card.key">
										<n-card size="small" class="metric-card compact-card" embedded>
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
										</n-card>
									</n-gi>
								</n-grid>
							</div>

							<!-- ACTION BUTTONS -->
							<div class="action-buttons">
								<!-- Primary -->
								<n-button
									type="primary"
									size="small"
									round
									class="action-btn primary"
									@click="goToNewWorkflow"
								>
									<Plus class="btn-icon" />
									Create Agent
								</n-button>

								<!-- View Executions -->
								<n-button size="small" round class="action-btn secondary" @click="goToExecutions">
									<Play class="btn-icon btn-icon-outline" />
									View Executions
								</n-button>

								<!-- Projects -->
								<n-button size="small" round class="action-btn secondary">
									<Zap class="btn-icon" />
									Projects
								</n-button>
							</div>

							<!-- MAIN GRID -->
							<div class="main-grid">
								<n-grid :cols="24" :x-gap="20" :y-gap="20">
									<!-- LEFT -->
									<n-gi :span="16">
										<div class="left-column">
											<!-- NEEDS ATTENTION -->
											<n-card size="small" class="needs-attention">
												<div class="needs-header">
													<div class="needs-title">
														<AlertTriangle class="needs-title-icon" />
														<span>Needs Attention</span>
													</div>
													<div class="needs-count">2</div>
												</div>

												<div class="needs-list">
													<!-- Card 1 -->
													<div class="needs-item needs-critical">
														<div class="needs-left">
															<div class="needs-icon critical-icon">
																<XCircle class="needs-inner-icon" />
															</div>
															<div class="needs-main">
																<div class="needs-name">Expense Anomaly Detection</div>
																<div class="needs-desc">
																	Database connection timeout — unable to fetch expense records
																</div>
																<div class="needs-date-inline">13/12/2024</div>
															</div>
														</div>
														<div class="needs-right">
															<n-button
																size="tiny"
																type="error"
																round
																class="needs-btn needs-btn-primary"
															>
																Fix Now
																<ChevronRight class="needs-arrow" />
															</n-button>
														</div>
													</div>

													<!-- Card 2 -->
													<div class="needs-item needs-warning">
														<div class="needs-left">
															<div class="needs-icon warning-icon">
																<AlertTriangle class="needs-inner-icon" />
															</div>
															<div class="needs-main">
																<div class="needs-name">Expense Anomaly Detection</div>
																<div class="needs-desc">Success rate dropped to 82.1%</div>
																<div class="needs-date-inline">Last run: 13/12/2024</div>
															</div>
														</div>
														<div class="needs-right">
															<n-button size="tiny" round tertiary class="needs-btn">
																Review
																<ChevronRight class="needs-arrow" />
															</n-button>
														</div>
													</div>
												</div>
											</n-card>

											<!-- ACTIVITY STREAM -->
											<n-card size="small" class="activity-section">
												<div class="activity-header">
													<div class="activity-title">
														<span class="live-dot"></span>
														<span class="live-text">LIVE</span>
														Activity Stream
													</div>
													<button class="view-all">
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
														:class="{
															clickable: activity.id !== 'placeholder-1',
														}"
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

									<!-- RIGHT -->
									<n-gi :span="8">
										<div class="right-column">
											<!-- MVP AGENTS -->
											<n-card size="small" class="mvp-card">
												<div class="mvp-header">
													<div class="mvp-title">
														<Trophy class="mvp-trophy" />
														MVP Agents
													</div>
												</div>

												<div class="mvp-divider"></div>

												<div class="mvp-list">
													<div v-if="agentsLoading && !mvpAgents.length" class="state">
														Loading agents...
													</div>

													<div v-else-if="!agentsLoading && !mvpAgents.length" class="state">
														No agents yet. Create your first agent to see stats here.
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

												<button class="mvp-footer-link">View all agents</button>
											</n-card>

											<!-- 7-DAY TREND -->
											<n-card size="small" class="trend-card">
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
																<div
																	class="trend-bar success"
																	:style="{ height: day.success + '%' }"
																></div>
																<div
																	class="trend-bar failure"
																	:style="{ height: day.failure + '%' }"
																></div>
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
						<!-- /dashboard-inner -->
					</div>
				</div>
			</div>
		</n-layout-content>
	</n-layout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
	NLayout,
	NLayoutContent,
	NGrid,
	NGi,
	NCard,
	NButton,
	NBadge,
	NInput,
	NTag,
} from 'naive-ui';
import {
	Search,
	Bell,
	CheckCircle2,
	Clock,
	AlertTriangle,
	XCircle,
	ArrowUpRight,
	ArrowDownRight,
	ChevronRight,
	Trophy,
	Flame,
	Plus,
	Play,
	Zap,
} from 'lucide-vue-next';
import { useWorkflowsStore } from '@/app/stores/workflows.store';
import { useTemplatesStore } from '../stores/templates.store';
import { useUserAgentMappingsStore } from '@src/stores/userAgentMappings.store';

const router = useRouter();
const workflowsStore = useWorkflowsStore();
const templatesStore = useTemplatesStore();
const userAgentMappingsStore = useUserAgentMappingsStore();

const search = ref('');

/* n8n bindings – DO NOT TOUCH */
const workflows = computed(() => workflowsStore.allWorkflows);
const loading = computed(() => workflowsStore.isLoading);

async function loadWorkflows() {
	await workflowsStore.fetchWorkflows();
}

function goToNewWorkflow() {
	router.push('/workflow/new');
}

function goToExecutions() {
	router.push('/executions');
}

function openWorkflow(id) {
	router.push(`/workflow/${id}`);
}

function publishAsTemplate(id) {
	templatesStore.publishAsTemplate(id);
}

/* ACTIVITY STREAM DATA */
const activities = computed(() => {
	if (!workflows.value || workflows.value.length === 0) {
		return [
			{
				id: 'placeholder-1',
				type: 'info',
				icon: '📋',
				title: 'No activities yet',
				subtitle: 'Create your first agent to see activity here',
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

/* LIVE METRICS */
const metricsLoading = ref(false);

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

async function loadMetrics() {
	try {
		metricsLoading.value = true;

		const res = await fetch('/rest/agent-metrics');
		const data = await res.json();

		metrics.value = {
			systemHealth: data.systemHealth ?? 92,
			executions7d: data.executions7d ?? 10816,
			executionsDelta: data.executionsDelta ?? 12.3,
			successRate: data.successRate ?? 97.4,
			successDelta: data.successDelta ?? 2.1,
			failures7d: data.failures7d ?? 254,
			failuresDelta: data.failuresDelta ?? -5.2,
			activeAgents: data.activeAgents ?? 7,
			activeAgentsDelta: data.activeAgentsDelta ?? 16.7,
		};
	} catch (e) {
		console.error('Failed to load metrics', e);
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
		positive: metrics.value.failuresDelta < 0 ? false : true,
		colorClass: 'bar-red',
		bars: [70, 50, 90, 60, 40, 55, 45],
	},
	{
		key: 'agents',
		label: 'ACTIVE AGENTS',
		value: String(metrics.value.activeAgents),
		delta:
			(metrics.value.activeAgentsDelta >= 0 ? '+' : '') + metrics.value.activeAgentsDelta + '%',
		positive: metrics.value.activeAgentsDelta >= 0,
		colorClass: 'bar-indigo',
		bars: [30, 40, 50, 60, 70, 80, 90],
	},
]);

/* MY-AGENTS: MVP AGENTS DATA */
const agentsLoading = ref(false);

const rawAgents = computed(() => userAgentMappingsStore.getUserAgentMappings());

// Map API result into a normalized shape
const normalizedAgents = computed(() =>
	rawAgents.value.map((item) => ({
		id: item.id,
		name: item.workflow?.name ?? 'Unnamed Agent',
		runs: item.executions ?? item.total_executions ?? 0,
		successRate: item.success_rate ?? 0,
	})),
);

// Top 5 agents by success rate (and runs as tiebreaker)
const mvpAgents = computed(() =>
	normalizedAgents.value
		.slice()
		.sort((a, b) => {
			if ((b.successRate ?? 0) === (a.successRate ?? 0)) {
				return (b.runs ?? 0) - (a.runs ?? 0);
			}
			return (b.successRate ?? 0) - (a.successRate ?? 0);
		})
		.slice(0, 5)
		.map((agent, index) => ({
			...agent,
			rank: index + 1,
		})),
);

/* TREND DATA (static for now) */
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
.page-shell {
	width: 100%;
	height: 100vh;
	background: var(--color--background--light-2);
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
}

.page-inner {
	flex: 1;
	display: flex;
}

.dashboard-scroll {
	flex: 1;
	overflow-y: auto;
}

/* outer container spans full width; no horizontal padding */
.dashboard {
	width: 100%;
	min-height: 100%;
	padding-top: 16px;
	padding-bottom: 24px;
	background: var(--color--background--light-2);
}

/* inner container keeps all cards aligned and away from edges */
.dashboard-inner {
	padding-left: 32px;
	padding-right: 100px;
}

/* HEADER */
.header {
	position: sticky;
	top: 0;
	z-index: 8;
	background: var(--color--background--light-3);
	padding: 12px 32px;
	border-radius: 0;
	margin-top: -16px;
	margin-bottom: 16px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06);
	border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.page-title {
	font-size: 18px;
	font-weight: 600;
	color: var(--color--text--shade-1);
}

.search-wrapper {
	position: relative;
	flex: 1;
	max-width: 460px;
	margin: 0 auto;
}

.search-icon {
	position: absolute;
	left: 12px;
	top: 50%;
	transform: translateY(-50%);
	width: 16px;
	height: 16px;
	color: var(--color--text--tint-1);
}

.search-input {
	padding-left: 32px;
	border-radius: 999px;
	--n-border-radius: 999px;
}

.header-right {
	position: relative;
	flex-shrink: 0;
	padding-right: 0;
}

.notification-btn {
	width: 32px;
	height: 32px;
	border-radius: 999px;
	border: 1px solid var(--border-color--light);
	background: var(--color--background--light-3);
}
.notif-icon {
	width: 20px;
	height: 20px;
}

/* METRICS STRIP */
.metrics-strip {
	background: var(--color--background--light-3);
	border-radius: 16px;
	border: 1px solid var(--border-color--light);
	padding: 18px 20px;
	box-shadow: var(--shadow--light);
	margin-bottom: 16px;
}

.metric-card {
	border-radius: 16px;
	border: 1px solid var(--border-color--light);
	box-shadow: none;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	min-height: 112px;
}

/* health */
.health-card {
	border: 1px solid var(--color--success--tint-2);
}

.health-value {
	font-size: 40px;
	font-weight: 700;
	color: var(--color--text--shade-1);
	line-height: 1;
}
.percent {
	font-size: 22px;
}
.health-label {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 12px;
	color: var(--color--text);
}
.health-icon {
	width: 14px;
	height: 14px;
	color: var(--color--success);
}
.health-status {
	margin-top: 4px;
	background: var(--color--success--tint-4) !important;
	color: var(--color--success--shade-1) !important;
}
.health-time {
	margin-top: 4px;
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 11px;
	color: var(--color--text--tint-1);
}
.time-icon {
	width: 12px;
	height: 12px;
}

/* compact cards */
.compact-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}
.card-label {
	font-size: 10px;
	font-weight: 600;
	letter-spacing: 0.3px;
	text-transform: uppercase;
	color: var(--color--text);
}
.mini-chart {
	display: flex;
	align-items: flex-end;
	gap: 2px;
	height: 18px;
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
	font-size: 30px;
	font-weight: 700;
	color: var(--color--text--shade-1);
	margin-bottom: 4px;
}
.compact-change {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 12px;
	font-weight: 600;
}
.compact-change.positive {
	color: var(--color--success);
}
.compact-change.negative {
	color: var(--color--danger);
}
.change-icon {
	width: 12px;
	height: 12px;
}

/* ACTION BUTTONS */
.action-buttons {
	display: flex;
	gap: 8px;
	margin-bottom: 16px;
}

.action-btn {
	display: inline-flex;
	align-items: center;
	font-size: 13px;
	font-weight: 600;
	border-radius: 999px;
	padding: 7px 18px;
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

/* MAIN GRID */
.main-grid {
	margin-top: 0;
}

.left-column,
.right-column {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

/* NEEDS ATTENTION */
.needs-attention {
	background: var(--color--background--light-3) !important;
	border-radius: 16px;
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
