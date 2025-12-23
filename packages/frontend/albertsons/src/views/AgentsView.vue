<script setup>
import { computed, onMounted, ref, h } from 'vue';
import { useRouter } from 'vue-router';
import { useUserAgentMappingsStore } from '@src/stores/userAgentMappings.store';
import { NDropdown, NIcon } from 'naive-ui';
import { Play, EllipsisVertical, Clock, ClockCheck, Pause, Edit } from 'lucide-vue-next';
import dayjs from 'dayjs';

const router = useRouter();
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

const filteredUserAgentMappings = computed(() => userAgentMappingsData.value);

function goToNewWorkflow() {
	router.push('/workflow/new');
}

function goToEditWorkflow(id) {
	router.push(`/workflow/${id}`);
}
</script>

<template>
	<div class="page-shell">
		<!-- PAGE ACTIONS -->
		<div class="page-actions">
			<button class="primary" @click="goToNewWorkflow">+ New Agent</button>
		</div>

		<!-- AGENT LIST -->
		<div class="card">
			<div class="table-wrapper">
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Project</th>
							<th>Status</th>
							<th>Trigger</th>
							<th>Last Run</th>
							<th>Success Rate</th>
							<th></th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="item in filteredUserAgentMappings" :key="item.id" class="workflow_entry">
							<td class="workflow_name">
								{{ item.workflow.name }}
								<br />
								<small class="txt_secondary"> {{ item.workflow.nodes.length }} nodes </small>
							</td>

							<td class="txt_secondary">-</td>

							<td>
								<span :class="['status', item?.workflow?.active ? 'active' : 'inactive']">
									<ClockCheck v-if="item?.workflow?.active" :size="11" />
									<Pause v-else :size="11" />
									{{ item?.workflow?.active ? 'Active' : 'Inactive' }}
								</span>
							</td>

							<td class="txt_secondary flex">
								<Clock class="clock_icon" />
								{{
									item?.workflow?.nodes?.[0]?.type
										?.split('.')
										?.pop()
										?.replace(/^\w/, (c) => c.toUpperCase()) || ''
								}}
							</td>

							<td class="txt_secondary">
								{{ dayjs(item?.last_execution?.startedAt).format('MMM DD, hh:mm A') }}
							</td>

							<td class="txt_secondary progress_bar">
								<div class="progress">
									<div class="bar" :style="{ width: item?.success_rate + '%' }"></div>
								</div>
								<span>{{ item?.success_rate }}%</span>
							</td>

							<td class="txt_secondary">
								<Play class="action_icons" />
								<n-dropdown
									trigger="hover"
									:options="options"
									@select="goToEditWorkflow(item?.workflowId)"
								>
									<EllipsisVertical class="action_icons" />
								</n-dropdown>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<style scoped>
.page-shell {
	padding: 16px;
	width: 100%;
	background: var(--color--background);
}

/* ACTION BAR */
.page-actions {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 16px;
}

.primary {
	background: var(--color-primary-blue);
	color: var(--button--color--text--primary);
	border-radius: var(--radius);
	padding: 10px 18px;
	border: none;
	font-weight: 600;
	cursor: pointer;
}

/* TABLE CARD */
.card {
	border: 1px solid var(--border-color--light);
	background-color: var(--color--background--light-1);
	border-radius: 8px;
	margin: 10px 0;
}

.table-wrapper {
	overflow-x: auto;
}

table {
	width: 100%;
	border-collapse: collapse;
	min-width: 600px;
}

th {
	text-transform: uppercase;
	font-weight: 500;
	color: var(--color-text-secondary);
	border-bottom: 1px solid var(--border-color--light);
}

th,
td {
	font-size: 12px;
	padding: 20px;
	text-align: left;
	font-weight: 500;
	min-width: 150px;
}

thead {
	background: var(--color--background);
}

.workflow_entry {
	border-bottom: 1px solid var(--border-color--light);
}

.workflow_status {
	display: inline-flex;
	align-items: center;
	gap: 3px;
}

.txt_secondary {
	color: var(--color-text-secondary);
}

.status {
	padding: 4px 10px;
	border-radius: 12px;
	font-size: 11px;
}

.active {
	background: var(--color-light-green);
	color: var(--color--success);
}

.inactive {
	background: var(--color-light-orange);
	color: var(--color-warning-orange);
}

.flex {
	display: flex;
	align-items: center;
}

.clock_icon {
	height: 14px;
	margin-right: 4px;
}

.action_icons {
	height: 16px;
	cursor: pointer;
}

.progress_bar {
	display: flex;
	align-items: center;
	gap: 6px;
}

.progress {
	height: 6px;
	background: #eee;
	border-radius: 5px;
	width: 3rem;
}

.bar {
	height: 6px;
	background: var(--color--success);
	border-radius: 8px;
}
</style>
