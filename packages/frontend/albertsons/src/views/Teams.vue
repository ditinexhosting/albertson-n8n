<template>
	<div class="p-4! w-full h-screen">
		<!-- Header with Create Button only -->
		<div class="flex items-center justify-between mb-8">
		<div>
		<h2 class="text-xl font-semibold text-foreground">Teams</h2>
		<p class="text-sm text-secondary">
			Collaborate with your colleagues
		</p>
	</div>
			<n-button type="primary" @click="showCreateTeamModal = true">
				<template #icon>
					<n-icon><Plus /></n-icon>
				</template>
				Create Team
			</n-button>
		</div>

		<!-- Teams Grid -->
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
			<n-card
				v-for="team in teams"
				:key="team.id"
				:bordered="true"
				hoverable
				class="rounded-lg! transition-all h-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
				:content-style="{
					padding: '18px 20px 14px 20px',
					display: 'flex',
					flexDirection: 'column',
					height: '100%',
				}"
			>
				<!-- HEADER -->
				<div class="mb-3">
					<div class="flex items-start justify-between mb-1">
						<h3 class="text-[15px] font-bold leading-snug leading-tight text-foreground">
							{{ team.name }}
						</h3>

						<n-dropdown :options="teamMenuOptions" @select="(key) => handleTeamAction(key, team)">
							<n-button text @click.stop>
								<n-icon :size="16"><MoreVertical /></n-icon>
							</n-button>
						</n-dropdown>
					</div>

					<!-- description immediately under title -->
					<p class="text-[11px] text-secondary leading-snug leading-tight">
						{{ team.description }}
					</p>
				</div>

				<!-- STATS with min-h-13 gap row -->
				<div class="flex items-center gap-4 text-[11px] text-secondary mb-3">
					<div class="flex items-center gap-1.5 min-h-13">
						<Users :size="20" />
						<span>{{ team.memberCount }} Members</span>
					</div>
					<div class="flex items-center gap-1.5">
						<FolderKanban :size="20" />
						<span>{{ team.projectCount }} Projects</span>
					</div>
				</div>

				<!-- divider -->
				<div class="border-t border-border-primary mb-3"></div>

				<!-- TEAM MEMBERS -->
				<div class="mb-3">
					<p class="text-[11px] text-secondary mb-1.5 tracking-wide uppercase font-medium">
						Team Members
					</p>

					<div class="space-y-1.5">
						<div v-for="member in team.members" :key="member.id" class="flex items-center gap-2">
							<n-avatar
								round
								:size="26"
								class="text-[10px] font-semibold"
								:style="{ backgroundColor: 'var(--color--primary)' }"
							>
								{{ member.initials }}
							</n-avatar>

							<div class="leading-tight">
								<p class="text-[11px] font-medium text-foreground">
									{{ member.name }}
								</p>
								<p class="text-[10px] text-secondary">
									{{ member.role }}
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- bottom divider -->
				<div class="border-t border-border-primary mb-1.5"></div>

				<!-- FOOTER -->
				<div class="mt-auto pt-0">
					<p class="text-[10px] text-secondary">Created {{ team.createdDate }}</p>
				</div>
			</n-card>
		</div>

		<!-- Create Team Modal -->
		<n-modal
			v-model:show="showCreateTeamModal"
			preset="card"
			:style="{ width: '500px', maxWidth: '95vw' }"
			:bordered="false"
			:closable="true"
			class="rounded-lg!"
		>
			<template #header>
				<h3 class="text-lg font-semibold">Create Team</h3>
			</template>

			<n-form
				ref="formRef"
				:model="formValue"
				:rules="formRules"
				label-placement="top"
				size="medium"
			>
				<n-form-item label="Team Name" path="name">
					<n-input v-model:value="formValue.name" placeholder="Enter team name" />
				</n-form-item>

				<n-form-item label="Description" path="description">
					<n-input
						v-model:value="formValue.description"
						type="textarea"
						placeholder="Enter team description"
						:rows="3"
					/>
				</n-form-item>

				<n-form-item label="Add Members">
					<n-select
						v-model:value="formValue.members"
						multiple
						filterable
						placeholder="Select team members"
						:options="availableMembers"
					/>
				</n-form-item>
			</n-form>

			<template #footer>
				<div class="flex justify-end gap-2">
					<n-button @click="showCreateTeamModal = false"> Cancel </n-button>
					<n-button type="primary" :loading="loading" :disabled="loading" @click="handleCreateTeam">
						<template #icon>
							<n-icon :size="14"><Plus /></n-icon>
						</template>
						Create Team
					</n-button>
				</div>
			</template>
		</n-modal>
	</div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue';
import { Users, Plus, FolderKanban, MoreVertical, Edit, Trash2 } from 'lucide-vue-next';
import {
	NButton,
	NCard,
	NIcon,
	NAvatar,
	NModal,
	NForm,
	NFormItem,
	NInput,
	NSelect,
	NDropdown,
} from 'naive-ui';

// State
const showCreateTeamModal = ref(false);
const loading = ref(false);

// Form
const formValue = ref({
	name: '',
	description: '',
	members: [] as string[],
});

const formRules = {
	name: {
		required: true,
		message: 'Please input team name',
		trigger: ['input', 'blur'],
	},
	description: {
		required: true,
		message: 'Please input team description',
		trigger: ['input', 'blur'],
	},
};

// Mock data
const teams = ref([
	{
		id: 1,
		name: 'Platform Engineering',
		description: 'Core platform development and infrastructure automation.',
		memberCount: 8,
		projectCount: 3,
		createdDate: 'Jan 15, 2024',
		members: [
			{
				id: 1,
				name: 'Sarah Johnson',
				email: 'sarah.j@company.com',
				role: 'Team Lead',
				initials: 'SJ',
			},
			{
				id: 2,
				name: 'Mike Chen',
				email: 'mike.c@company.com',
				role: 'Member',
				initials: 'MC',
			},
			{
				id: 3,
				name: 'Lisa Patel',
				email: 'lisa.p@company.com',
				role: 'Member',
				initials: 'LP',
			},
		],
	},
	{
		id: 2,
		name: 'Marketing Automation',
		description: 'Customer engagement and marketing campaign workflows.',
		memberCount: 5,
		projectCount: 2,
		createdDate: 'Feb 1, 2024',
		members: [
			{
				id: 4,
				name: 'Alex Rodriguez',
				email: 'alex.r@company.com',
				role: 'Team Lead',
				initials: 'AR',
			},
			{
				id: 5,
				name: 'Sarah Johnson',
				email: 'sarah.j@company.com',
				role: 'Member',
				initials: 'SJ',
			},
		],
	},
	{
		id: 3,
		name: 'Supply Chain Analytics',
		description: 'Supply chain optimization and vendor management automation.',
		memberCount: 6,
		projectCount: 2,
		createdDate: 'Mar 1, 2024',
		members: [
			{
				id: 6,
				name: 'Mike Chen',
				email: 'mike.c@company.com',
				role: 'Team Lead',
				initials: 'MC',
			},
			{
				id: 7,
				name: 'David Kim',
				email: 'david.k@company.com',
				role: 'Member',
				initials: 'DK',
			},
			{
				id: 8,
				name: 'Lisa Patel',
				email: 'lisa.p@company.com',
				role: 'Member',
				initials: 'LP',
			},
		],
	},
	{
		id: 4,
		name: 'Store Operations',
		description: 'Store-level operations and performance monitoring.',
		memberCount: 4,
		projectCount: 1,
		createdDate: 'Apr 1, 2024',
		members: [
			{
				id: 9,
				name: 'Lisa Patel',
				email: 'lisa.p@company.com',
				role: 'Team Lead',
				initials: 'LP',
			},
			{
				id: 10,
				name: 'David Kim',
				email: 'david.k@company.com',
				role: 'Member',
				initials: 'DK',
			},
		],
	},
]);

const availableMembers = ref([
	{ label: 'Sarah Johnson', value: 'sarah.j@company.com' },
	{ label: 'Mike Chen', value: 'mike.c@company.com' },
	{ label: 'Lisa Patel', value: 'lisa.p@company.com' },
	{ label: 'Alex Rodriguez', value: 'alex.r@company.com' },
	{ label: 'David Kim', value: 'david.k@company.com' },
]);

const teamMenuOptions = [
	{
		label: 'Edit Team',
		key: 'edit',
		icon: () => h(Edit, { size: 14 }),
	},
	{
		label: 'Delete Team',
		key: 'delete',
		icon: () => h(Trash2, { size: 14 }),
	},
];

// Actions
function handleCreateTeam() {
	loading.value = true;
	setTimeout(() => {
		loading.value = false;
		showCreateTeamModal.value = false;
		formValue.value = {
			name: '',
			description: '',
			members: [],
		};
	}, 1000);
}

function handleTeamAction(key: string, team: any) {
	if (key === 'edit') {
		// Handle edit
	} else if (key === 'delete') {
		// Handle delete
	}
}
</script>