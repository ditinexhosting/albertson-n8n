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
						<div
							v-for="member in [...team.members].reverse()"
							:key="member.id"
							class="flex items-center justify-between"
						>
							<div class="flex items-center">
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
							<Trash2Icon
								v-if="member.role == 'Member'"
								class="text-danger cursor-pointer"
								:size="14"
								@click="() => handleDeleteMemberConfirm(team.id, member.id)"
							/>
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
			size="huge"
			:bordered="false"
			:closable="true"
			class="rounded-md!"
		>
			<template #header>
				<h3 class="text-lg font-semibold">
					{{ isUpdatingTeamDetails ? 'Update Team Details' : 'Create Team' }}
				</h3>
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
				<!-- 
				<n-form-item label="Add Members">
					<n-select
						v-model:value="formValue.members"
						multiple
						filterable
						placeholder="Select team members"
						:options="availableMembers"
					/>
				</n-form-item> -->
			</n-form>

			<template #footer>
				<div class="flex justify-end gap-2">
					<n-button class="rounded-md!" @click="showCreateTeamModal = false"> Cancel </n-button>
					<n-button
						type="primary"
						class="rounded-md!"
						:loading="teamLoading"
						:disabled="teamLoading"
						@click="isUpdatingTeamDetails ? onUpdateTeam() : onCreateTeam()"
					>
						<template #icon>
							<n-icon :size="14">
								<component :is="isUpdatingTeamDetails ? Check : Plus" />
							</n-icon>
						</template>
						{{ isUpdatingTeamDetails ? 'Update Team' : 'Create Team' }}
					</n-button>
				</div>
			</template>
		</n-modal>

		<!-- Add Team members Modal -->
		<n-modal
			v-model:show="showAddTeamMembersModal"
			preset="card"
			:style="{ width: '500px', maxWidth: '95vw' }"
			:bordered="false"
			size="huge"
			:closable="true"
			class="rounded-md!"
			:auto-focus="false"
		>
			<template #header>
				<h3 class="text-lg font-semibold">Add Team Members</h3>
			</template>

			<n-form ref="formRef" :model="formValueMembers" label-placement="top" size="medium">
				<n-form-item label="Team Name" path="name">
					<n-input
						v-model:value="formValueMembers.name"
						readonly
						class="pointer-events-none border border-border-primary focus:border-border-primary focus:ring-0 hover:border-border-primary"
					/>
				</n-form-item>

				<n-form-item label="Add Members">
					<n-select
						v-model:value="formValueMembers.members"
						multiple
						filterable
						placeholder="Select team members"
						:options="userOptions"
						label-field="label"
						value-field="value"
					/>
				</n-form-item>
			</n-form>

			<template #footer>
				<div class="flex justify-end gap-2">
					<n-button class="rounded-md!" @click="showAddTeamMembersModal = false"> Cancel </n-button>
					<n-button
						type="primary"
						class="rounded-md!"
						:loading="memberLoading"
						:disabled="memberLoading"
						@click="onAddTeamMembers"
					>
						<template #icon>
							<n-icon :size="14"><Plus /></n-icon>
						</template>
						Add Members
					</n-button>
				</div>
			</template>
		</n-modal>
	</div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, computed } from 'vue';
import dayjs from 'dayjs';
import { handleAction as handleActionAPI } from '@src/utils/handleAction';
import {
	createNewTeam,
	updateTeam,
	deleteTeam,
	getAllTeams,
	addTeamMembers,
	removeTeamMember,
	getAvailableUsers,
} from '@src/services/teams.service';
import { useUsersStore } from '@/features/settings/users/users.store';
import { useToast } from '@/app/composables/useToast';
import {
	Users,
	Plus,
	FolderKanban,
	MoreVertical,
	Edit,
	Trash2,
	Check,
	Trash2Icon,
} from 'lucide-vue-next';
import {
	NButton,
	NCard,
	NIcon,
	NAvatar,
	NModal,
	NForm,
	NFormItem,
	NInput,
	NDropdown,
	NEmpty,
	useDialog,
	NSelect,
} from 'naive-ui';

interface FormValue {
	name: string;
	description: string;
	ownerId: string;
	teamId?: string | null;
}

// State
const dialog = useDialog();
const usersStore = useUsersStore();
const toast = useToast();
const showCreateTeamModal = ref(false);
const isUpdatingTeamDetails = ref(false);
const teamLoading = ref(false);
const showAddTeamMembersModal = ref(false);
const memberLoading = ref(false);

// Form
const availableUsers = ref([]);
const teams = ref([]);
const formValue = ref<FormValue>({
	name: '',
	description: '',
	ownerId: usersStore.currentUser.id,
	teamId: null,
});

const formValueMembers = ref({
	name: '',
	teamId: '',
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

const userOptions = computed(() =>
	availableUsers?.value?.map((u) => ({
		label: `${u?.name} (${u?.email})`,
		value: u?.id,
	})),
);

const handleTeamAction = async (key, row) => {
	try {
		const teamId = row.id;
		switch (key) {
			case 'add_members':
				showAddTeamMembersModal.value = true;
				getAllAvailableUsers(teamId);
				formValueMembers.value = {
					teamId: teamId,
					name: row.name,
					members: [],
				};
				break;
			case 'edit':
				showCreateTeamModal.value = true;
				isUpdatingTeamDetails.value = true;
				formValue.value = {
					name: row.name,
					description: row.description,
					ownerId: row.ownerId,
					teamId: teamId,
				};
				break;
			case 'delete':
				handleDeleteTeamConfirm(teamId);
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

function handleDeleteTeamConfirm(teamId) {
	dialog.error({
		title: 'Delete Team',
		content: 'Are you sure?',
		positiveText: 'Delete',
		negativeText: 'Cancel',
		draggable: true,
		onPositiveClick: () => {
			onDeleteTeam(teamId);
		},
	});
}
function handleDeleteMemberConfirm(teamId, userId) {
	dialog.error({
		title: 'Delete Member',
		content: 'Are you sure?',
		positiveText: 'Delete',
		negativeText: 'Cancel',
		draggable: true,
		onPositiveClick: () => {
			onRemoveMember(teamId, userId);
		},
	});
}

// ------------------- APIS -------------------
const fetchAllTeams = () =>
	handleActionAPI({
		action: () => getAllTeams(),
		onSuccess: (res) => {
			teams.value = res || [];
		},
	});

const onCreateTeam = () =>
	handleActionAPI({
		loadingRef: teamLoading,
		action: () => createNewTeam(formValue.value),
		onSuccess: () => {
			showCreateTeamModal.value = false;
			formValue.value = {
				name: '',
				description: '',
				ownerId: usersStore.currentUser.id,
			};
			toast.showMessage({
				title: `Team`,
				message: 'Team created successfully.',
				type: 'success',
			});
			fetchAllTeams();
		},
		onError: () => {
			toast.showMessage({
				title: `Team`,
				message: 'Failed to create team.',
				type: 'error',
			});
		},
	});

const onUpdateTeam = () =>
	handleActionAPI({
		loadingRef: teamLoading,
		action: () => updateTeam(formValue.value.teamId, formValue.value),
		onSuccess: () => {
			showCreateTeamModal.value = false;
			isUpdatingTeamDetails.value = false;
			formValue.value = {
				name: '',
				description: '',
				ownerId: usersStore.currentUser.id,
				teamId: null,
			};
			toast.showMessage({
				title: `Team`,
				message: 'Team updated successfully.',
				type: 'success',
			});
			fetchAllTeams();
		},
		onError: () => {
			toast.showMessage({
				title: `Team`,
				message: 'Failed to update team.',
				type: 'error',
			});
		},
	});

const onDeleteTeam = (teamId) =>
	handleActionAPI({
		action: () => deleteTeam(teamId),
		onSuccess: () => {
			toast.showMessage({
				title: `Team`,
				message: 'Team deleted successfully.',
				type: 'success',
			});
			fetchAllTeams();
		},
		onError: () => {
			toast.showMessage({
				title: `Team`,
				message: 'Failed to delete team.',
				type: 'error',
			});
		},
	});

const onAddTeamMembers = () =>
	handleActionAPI({
		loadingRef: memberLoading,
		action: () => addTeamMembers(formValueMembers.value.teamId, formValueMembers.value),
		onSuccess: () => {
			showAddTeamMembersModal.value = false;
			toast.showMessage({
				title: `Team`,
				message: 'Team member added.',
				type: 'success',
			});
			fetchAllTeams();
		},
		onError: () => {
			toast.showMessage({
				title: `Team`,
				message: 'Failed to add team member.',
				type: 'error',
			});
		},
	});

const onRemoveMember = (teamId, userId) =>
	handleActionAPI({
		loadingRef: memberLoading,
		action: () => removeTeamMember(teamId, userId),
		onSuccess: () => {
			toast.showMessage({
				title: `Team`,
				message: 'Team member removed.',
				type: 'success',
			});
			fetchAllTeams();
		},
		onError: () => {
			toast.showMessage({
				title: `Team`,
				message: 'Failed to remove team member.',
				type: 'error',
			});
		},
	});

const getAllAvailableUsers = (teamId) =>
	handleActionAPI({
		loadingRef: memberLoading,
		action: () => getAvailableUsers(teamId),
		onSuccess: (res) => {
			availableUsers.value = res || [];
		},
	});
</script>
