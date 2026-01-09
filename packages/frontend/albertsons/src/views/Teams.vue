<template>
	<div class="flex flex-1 p-4! flex-col gap-4 overflow-x-auto! h-[90vh]!">
		<!-- Header with Create Button only -->
		<div class="flex items-center justify-between">
			<div>
				<div class="text-lg font-semibold mb-2">Teams</div>
				<div class="text-sm text-secondary">Collaborate with your colleagues</div>
			</div>
			<n-button class="rounded-md!" type="primary" @click="showCreateTeamModal = true">
				<template #icon>
					<n-icon><Plus /></n-icon>
				</template>
				Create Team
			</n-button>
		</div>

		<div v-if="teams.length === 0">
			<n-empty description="No teams found" />
		</div>

		<!-- Teams Grid -->
		<div
			class="my-4! grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch"
		>
			<n-card
				v-for="team in teams"
				:key="team.id"
				:bordered="true"
				hoverable
				class="rounded-md! transition-all h-full bg-white shadow-sm"
			>
				<!-- HEADER -->

				<div class="flex items-start justify-between">
					<div>
						<div class="text-lg font-semibold">{{ team.name }}</div>
						<div
							class="text-sm text-secondary mt-2! wrap-break-words! line-clamp-2 min-h-[2.4rem]!"
						>
							{{ team.description }}
						</div>
					</div>

					<n-dropdown
						trigger="click"
						class="cursor-pointer"
						:options="teamMenuOptions"
						@select="(key) => handleTeamAction(key, team)"
					>
						<MoreVertical class="cursor-pointer" />
					</n-dropdown>
				</div>

				<!-- STATS with min-h-13 gap row -->
				<div
					class="flex items-center gap-4 text-sm text-secondary my-4! py-3! border-b! border-border-primary!"
				>
					<div class="flex items-center gap-2">
						<Users :size="15" />
						<span>{{ team.total_member }} Members</span>
					</div>
					<div class="flex items-center gap-2">
						<FolderKanban :size="15" />
						<span>{{ team.total_project }} Projects</span>
					</div>
				</div>

				<!-- TEAM MEMBERS -->
				<div>
					<p class="text-xs text-secondary mb-2! uppercase font-medium">Team Members</p>

					<div class="overflow-x-auto! h-32! space-y-2!">
						<div v-for="member in team.members" :key="member.id" class="flex items-center">
							<n-avatar round size="small" color="#01529f" class="p-4! mr-2!">
								{{ member?.name?.split(' ')[0]?.[0] + member?.name?.split(' ').at(-1)?.[0] }}
							</n-avatar>

							<div>
								<p class="text-sm! font-medium">
									{{ member.name }}
								</p>
								<p class="text-xs! text-secondary">
									{{ member.role }}
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- FOOTER -->
				<div class="mt-4! pt-4! border-t! border-border-primary!">
					<p class="text-xs! text-secondary">
						Created {{ dayjs(team.createdAt).format('MMM DD, YYYY') }}
					</p>
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
import { ref, h, onMounted } from 'vue';
import dayjs from 'dayjs';
import { handleAction as handleActionAPI } from '@src/utils/handleAction';
import {
	createNewTeam,
	deleteTeam,
	getAllTeams,
	addTeamMembers,
	removeTeamMember,
} from '@src/services/teams.service';
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
	NEmpty,
} from 'naive-ui';

// State
const showCreateTeamModal = ref(false);
const loading = ref(false);

// Form
const teams = ref([]);
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

const teamMenuOptions = [
	{
		label: () => h('span', { class: 'text-primary' }, 'Add Members'),
		key: 'add_members',
		icon: () => h(Plus, { class: 'h-4 text-primary' }),
	},
	{
		label: 'Edit Team',
		key: 'edit',
		icon: () => h(Edit, { size: 14 }),
	},
	{
		label: () => h('span', { class: 'text-danger' }, 'Delete Team'),
		key: 'delete',
		icon: () => h(Trash2, { class: 'h-4 text-danger' }),
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

const handleTeamAction = async (key, row) => {
	try {
		switch (key) {
			case 'add_members':
				break;
			case 'edit':
				break;
			case 'delete':
				break;
			default:
				console.error(`Unknown action key: ${key}`);
		}
	} catch (e) {
		console.error('handle action failed', e);
	}
};

// Load initial data
onMounted(async () => {
	try {
		fetchAllTeams();
	} catch (e) {
		console.error('Failed to load initial api data for teams', e);
	}
});

// ------------------- APIS -------------------
const fetchAllTeams = () =>
	handleActionAPI({
		action: () => getAllTeams(),
		onSuccess: (res) => {
			teams.value = res || [];
		},
	});
</script>
