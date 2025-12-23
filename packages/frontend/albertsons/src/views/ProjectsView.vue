<template>
	<n-layout class="h-full bg-shell">
		<n-layout-content>
			<!-- PAGE HEADER -->
			<div class="page-header">
				<div>
					<h1 class="page-title">Projects</h1>
					<p class="page-subtitle">Manage your automation projects and agents</p>
				</div>

				<n-button type="primary" size="small" class="new-project-btn" @click="goToNewProject">
					<Plus size="16" />
					<span>New Project</span>
				</n-button>
			</div>

			<!-- PAGE BODY -->
			<div class="page-body">
				<n-grid :cols="24" :x-gap="20" :y-gap="20">
					<n-gi v-for="project in filteredProjects" :key="project.id" :span="6">
						<n-card class="project-card" hoverable @click="openProject(project.id)">
							<!-- CARD HEADER -->
							<div class="card-header">
								<div class="card-title">
									{{ project.name }}
								</div>

								<n-dropdown
									trigger="click"
									:options="projectMenu"
									@select="(key) => onProjectMenuSelect(key, project)"
								>
									<button class="more-btn" @click.stop>⋮</button>
								</n-dropdown>
							</div>

							<!-- TAGS -->
							<div class="card-tags">
								<n-tag
									size="small"
									round
									:type="project.status === 'Active' ? 'success' : 'default'"
								>
									{{ project.status }}
								</n-tag>

								<n-tag size="small" round secondary>
									{{ project.role }}
								</n-tag>
							</div>

							<!-- DESCRIPTION -->
							<p class="card-desc">
								{{ project.description }}
							</p>

							<hr class="divider" />

							<!-- STATS -->
							<div class="card-stats">
								<div class="stat">
									<Flame size="14" />
									<span>{{ project.agents }} Agents</span>
								</div>
								<div class="stat">
									<Play size="14" />
									<span>{{ project.runs.toLocaleString() }} Runs</span>
								</div>
								<div class="stat">
									<Users size="14" />
									<span>{{ project.members }} Members</span>
								</div>
							</div>

							<!-- FOOTER -->
							<div class="card-footer">
								<div class="avatars">
									<div v-for="(user, i) in project.initials" :key="i" class="avatar">
										{{ user }}
									</div>
								</div>

								<span class="updated"> Updated {{ project.updatedAt }} </span>
							</div>
						</n-card>
					</n-gi>
				</n-grid>
			</div>
		</n-layout-content>
	</n-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { NLayout, NLayoutContent, NGrid, NGi, NCard, NButton, NDropdown, NTag } from 'naive-ui';
import { Plus, Flame, Play, Users } from 'lucide-vue-next';

const router = useRouter();

const projects = ref([
	{
		id: 'p1',
		name: 'Inventory Management Automation',
		status: 'Active',
		role: 'Owner',
		description:
			'Automated workflows for real-time inventory tracking and restocking alerts across all stores.',
		agents: 12,
		runs: 4521,
		members: 3,
		updatedAt: 'Dec 13, 2024',
		initials: ['SJ', 'MC', 'LP'],
	},
	{
		id: 'p2',
		name: 'Customer Loyalty Program',
		status: 'Active',
		role: 'Editor',
		description:
			'Workflows managing Just for U rewards, personalized offers, and customer engagement.',
		agents: 8,
		runs: 2847,
		members: 2,
		updatedAt: 'Dec 13, 2024',
		initials: ['ER', 'SJ'],
	},
]);

const filteredProjects = computed(() => projects.value);

const projectMenu = [
	{ label: 'Open', key: 'open' },
	{ label: 'Edit', key: 'edit' },
	{ label: 'Duplicate', key: 'duplicate' },
	{ label: 'Archive', key: 'archive' },
];

function onProjectMenuSelect(key, project) {
	if (key === 'open') openProject(project.id);
}

function openProject(id) {
	router.push(`/projects/${id}`);
}

function goToNewProject() {
	router.push('/projects/new');
}
</script>

<style scoped>
.bg-shell {
	background: #f7f9fc;
}

/* HEADER */
.page-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24px 48px 16px;
}

.page-title {
	font-size: 24px;
	font-weight: 700;
	color: #111827;
}

.page-subtitle {
	font-size: 13px;
	color: #6b7280;
	margin-top: 4px;
}

.new-project-btn {
	display: flex;
	align-items: center;
	gap: 6px;
	font-weight: 600;
}

/* BODY */
.page-body {
	padding: 0 48px 48px;
	max-width: 1200px;
}

/* CARD */
.project-card {
	border-radius: 8px;
	border: 1px solid #e5e7eb;
	padding: 16px;
	height: 100%;
	cursor: pointer;
	transition:
		box-shadow 0.2s ease,
		transform 0.2s ease;
}

.project-card:hover {
	box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
	transform: translateY(-2px);
}

/* CARD HEADER */
.card-header {
	display: flex;
	justify-content: space-between;
	align-items: start;
	margin-bottom: 8px;
}

.card-title {
	font-size: 15px;
	font-weight: 600;
	color: #111827;
	line-height: 1.3;
}

.more-btn {
	background: none;
	border: none;
	cursor: pointer;
	font-size: 18px;
	color: #6b7280;
}

/* TAGS */
.card-tags {
	display: flex;
	gap: 8px;
	margin-bottom: 10px;
}

/* DESC */
.card-desc {
	font-size: 13px;
	color: #6b7280;
	line-height: 1.5;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	margin-bottom: 12px;
}

/* DIVIDER */
.divider {
	border: none;
	border-top: 1px solid #eef2f7;
	margin: 10px 0;
}

/* STATS */
.card-stats {
	display: flex;
	gap: 14px;
	font-size: 12px;
	color: #6b7280;
}

.stat {
	display: flex;
	align-items: center;
	gap: 4px;
}

/* FOOTER */
.card-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 12px;
}

.avatars {
	display: flex;
	gap: 6px;
}

.avatar {
	width: 26px;
	height: 26px;
	border-radius: 50%;
	background: #2563eb;
	color: #fff;
	font-size: 11px;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px solid #fff;
}

.updated {
	font-size: 12px;
	color: #9ca3af;
}
</style>
