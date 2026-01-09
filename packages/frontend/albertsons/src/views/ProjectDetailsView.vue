<template>
	<div class="flex flex-1 p-4! flex-col gap-4">
		<div class="flex flex-row gap-4 items-start justify-start">
			<div v-on:click="goBack" class="mt-2! text-black hover:text-primary cursor-pointer">
				<ArrowLeft />
			</div>
			<div>
				<div class="flex flex-row justify-start gap-4">
					<div class="text-2xl font-bold">{{ project.name }}</div>
					<n-tag
						:type="roleType(meOnCurrentProject?.role)"
						size="small"
						round
						class="font-semibold mt-2!"
					>
						<div class="flex items-center gap-2">
							<component :is="roleIcon(meOnCurrentProject?.role)" size="16" />
							<div>You are {{ meOnCurrentProject?.role }}</div>
						</div>
					</n-tag>
				</div>
			</div>
		</div>
		<div class="text-base text-secondary max-w-[70%]!">
			{{ project.description }}
		</div>
		<n-space v-if="canManageProject">
			<n-button class="rounded-md!" :disabled="true"
				><template #icon>
					<NIcon>
						<Settings />
					</NIcon> </template
				>Settings</n-button
			>
			<n-button class="rounded-md!" type="primary" @click="showAddAgentModal = true"
				><template #icon>
					<NIcon>
						<Plus />
					</NIcon> </template
				>Add Agent</n-button
			>
			<n-button class="rounded-md!" type="primary" @click="showAddMemberModal = true"
				><template #icon>
					<NIcon>
						<Plus />
					</NIcon> </template
				>Add Member / Team</n-button
			>
		</n-space>
		<n-divider />
		<n-tabs type="line" animated>
			<n-tab-pane name="agents" :tab="`Agents (${project.agents?.length || 0})`">
				<n-data-table :columns="agentsColumns" :data="project.agents" :scroll-x="900" />
			</n-tab-pane>
			<n-tab-pane name="members" :tab="`Team Members (${project.members?.length || 0})`">
				<n-data-table :columns="columns" :data="sortedMembers" />
			</n-tab-pane>
		</n-tabs>
		<n-modal
			v-model:show="showAddMemberModal"
			:mask-closable="false"
			preset="card"
			size="huge"
			style="width: 600px"
		>
			<template #header> {{ 'Add Team / Member' }} </template>
			<n-form :ref="formRef" :label-width="80" :model="formValue" size="medium">
				<n-grid x-gap="12" :cols="1">
					<n-gi>
						<n-form-item label="Users" path="users">
							<n-select
								multiple
								filterable
								v-model:value="formValue.users"
								:options="availableUsersToAddAsMember"
							/>
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Role" path="role">
							<n-select v-model:value="formValue.role" :options="availableRoles" />
						</n-form-item>
					</n-gi>
				</n-grid>
			</n-form>
			<template #footer>
				<div class="flex flex-row flex-1 gap-4 justify-end!">
					<n-button class="rounded-md!" ghost type="primary" @click="showAddMemberModal = false"
						>Close</n-button
					>
					<n-button
						class="rounded-md!"
						:loading="modalSubmitLoading"
						type="primary"
						@click="onAddMember"
						>Submit</n-button
					>
				</div>
			</template>
		</n-modal>
		<n-modal
			v-model:show="showAddAgentModal"
			:mask-closable="false"
			preset="card"
			size="huge"
			style="width: 600px"
		>
			<template #header> {{ 'Add Agent' }} </template>
			<n-form :ref="formRef2" :label-width="80" :model="formValue" size="medium">
				<n-grid x-gap="12" :cols="1">
					<n-gi>
						<n-form-item label="Agents" path="agentIds">
							<n-select
								multiple
								filterable
								v-model:value="formValue2.agentIds"
								:options="availableAgentsToAddInProject"
							/>
						</n-form-item>
					</n-gi>
				</n-grid>
			</n-form>
			<template #footer>
				<div class="flex flex-row flex-1 gap-4 justify-end!">
					<n-button class="rounded-md!" ghost type="primary" @click="showAddAgentModal = false"
						>Close</n-button
					>
					<n-button
						class="rounded-md!"
						:loading="modalSubmitLoading"
						type="primary"
						@click="onAddAgent"
						>Submit</n-button
					>
				</div>
			</template>
		</n-modal>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, render, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUsersStore } from '@/features/settings/users/users.store';
import dayjs from 'dayjs';
import {
	NLayout,
	NLayoutContent,
	NGrid,
	NGi,
	NCard,
	NButton,
	NDropdown,
	NTag,
	NIcon,
	NModal,
	NForm,
	NFormItem,
	NInput,
	NSelect,
	NSwitch,
	NDataTable,
	NAvatarGroup,
	NAvatar,
	NTooltip,
	NSpace,
	NDivider,
	NTabs,
	NTabPane,
	useDialog,
	NDialogProvider,
	NProgress,
} from 'naive-ui';
import {
	Plus,
	Flame,
	Play,
	Users,
	MoreVertical,
	Crown,
	PenLine,
	Eye,
	GitBranch,
	ArrowLeft,
	Settings,
	ClockCheck,
	Pause,
	EllipsisVertical,
	Edit,
} from 'lucide-vue-next';
import { PROJECT_STATUS } from '@src/utils/constants';
import { useToast } from '@/app/composables/useToast';
import { PROJECT_ROLE } from '@src/utils/constants';
import { runWorkflow } from '@src/utils/runWorkflow';
import { getProgressStatus } from '@src/utils/helper';
import { handleAction } from '@src/utils/handleAction';
import { addMember, getAllUsers, removeMember } from '@src/services/users.service';
import { getProjectDetails } from '@src/services/projects.service';
import { getAllAgents, removeAgent, addAgent } from '@src/services/agents.service';

const router = useRouter();
const route = useRoute();
const projectId = route.params.id;
const showAddMemberModal = ref(false);
const showAddAgentModal = ref(false);
const modalSubmitLoading = ref(false);
const usersStore = useUsersStore();
const toast = useToast();

const formRef = ref(null);
const formRef2 = ref(null);
const formValue = ref({
	users: [],
	role: null,
});
const formValue2 = ref({
	agentIds: [],
});
const dialog = useDialog();
const columns = createColumns();
const agentsColumns = createAgentsColumns();
const project = ref([]);
const users = ref([]);
const agents = ref([]);
const availableRoles = computed(() => {
	return Object.entries(PROJECT_ROLE)
		.filter(([key, value]) => value != PROJECT_ROLE.OWNER)
		.map(([key, value]) => ({
			label: value,
			value: value,
		}));
});
const availableUsersToAddAsMember = computed(() => {
	return users.value
		.filter((user) => !project.value.members.some((member) => member.userId === user.ownerId))
		.map((user) => ({
			label: user?.owner?.firstName + ' ' + user?.owner?.lastName + ' (' + user?.owner?.email + ')',
			value: user?.ownerId,
		}));
});

const availableAgentsToAddInProject = computed(() => {
	return agents.value
		.filter((agent) => !project.value?.agents?.some((pagent) => pagent.id === agent.workflowId))
		.map((agent) => ({
			label: agent.workflow?.name,
			value: agent.workflow?.id,
		}));
});
const meOnCurrentProject = computed(() => {
	const currentUser = usersStore.currentUser;
	if (!project.value || !project.value.members || !currentUser) {
		return null;
	}

	return project.value.members.find((member) => member.userId === currentUser.id) || null;
});
const canManageProject = computed(() => {
	const role = meOnCurrentProject.value?.role;
	return role === PROJECT_ROLE.OWNER || role === PROJECT_ROLE.EDITOR;
});

const sortedMembers = computed(() => sortByRole(project.value.members));

const goBack = () => {
	router.back();
};

function createColumns() {
	return [
		{
			title: 'First Name',
			key: 'firstName',
		},
		{
			title: 'Last Name',
			key: 'lastName',
		},
		{
			title: 'Email',
			key: 'email',
		},
		{
			title: 'Role',
			key: 'role',
		},
		{
			title: 'Team',
			key: 'team',
			render: () => {
				return '-';
			},
		},
		{
			title: 'Action',
			key: 'actions',
			render: (row) => {
				if (row.userId == project.value?.ownerId || !canManageProject.value) return '';
				return h(
					NDropdown,
					{
						options: memberActionOptions,
						trigger: 'click',
						onSelect: (key) => handleMemberAction(key, row),
					},
					{
						default: () =>
							h(
								NButton,
								{
									quaternary: true,
									circle: true,
								},
								{
									icon: renderIcon(MoreVertical),
								},
							),
					},
				);
			},
		},
	];
}
const tableHeader = (text) => h('span', { class: 'text-secondary' }, text);
const getAgentOptions = (canManageProject) => [
	{
		label: canManageProject ? 'View/Edit Agent' : 'View Agent',
		key: 'view',
	},
	...(canManageProject
		? [
				{
					label: 'Remove Agent',
					key: 'remove_agent',
				},
			]
		: []),
];

const handleAgentsAction = async (key, row) => {
	try {
		switch (key) {
			case 'remove_agent':
				handleAgentRemoveConfirm(row);
				break;
			case 'view':
				router.push(`/workflow/${row.id}`);
				break;
			default:
				console.error(`Unknown action key for agents: ${key}`);
		}
	} catch (e) {
		console.error('handle action failed for agents', e);
	}
};

function handleAgentRemoveConfirm(row) {
	dialog.error({
		title: 'Removing Agent',
		content: 'Are you sure ?',
		positiveText: 'Delete',
		negativeText: 'Cancel',
		draggable: true,
		onPositiveClick: () => {
			onRemoveAgent(row.id);
		},
		onNegativeClick: () => {},
	});
}

function createAgentsColumns() {
	return [
		{
			title: () => tableHeader('NAME'),
			key: 'name',
			render: (row) =>
				h('span', [
					row.name,
					h('br'),
					h(
						'small',
						{ class: 'text-secondary block max-w-52 truncate' },
						`${row.description || ''}`,
					),
				]),
		},
		{
			title: () => tableHeader('STATUS'),
			key: 'active',
			render: (row) => {
				const isActive = !row?.active;

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
			key: 'nodes',
			render: (row) =>
				row?.nodes?.[0]?.type
					?.split('.')
					?.pop()
					?.replace(/^\w/, (c) => c.toUpperCase()) || '-',
		},
		{
			title: () => tableHeader('LAST RUN'),
			key: 'last_execution',
			render: (row) =>
				row?.lastRun?.startedAt ? dayjs(row?.lastRun?.startedAt).format('MMM DD, hh:mm A') : '-',
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
						status: getProgressStatus(row.successRate),
						percentage: row?.successRate,
						indicatorPlacement: 'inside',
					}),
				),
		},
		{
			title: ' ',
			key: 'actions',
			render: (row) => {
				return h('div', { class: 'flex items-center gap-3 text-gray-400' }, [
					canManageProject.value &&
						h(Play, {
							class: 'w-4 cursor-pointer',
							onClick: () => runWorkflow(router, row),
						}),
					h(
						NDropdown,
						{
							trigger: 'click',
							options: getAgentOptions(canManageProject.value),
							onSelect: (key) => handleAgentsAction(key, row),
						},
						{
							default: () => h(EllipsisVertical, { class: 'w-4 cursor-pointer' }),
						},
					),
				]);
			},
		},
	];
}

const sortByRole = (users = []) => {
	return users.sort(
		(a, b) =>
			['Owner', 'Editor', 'Viewer'].indexOf(a.role) - ['Owner', 'Editor', 'Viewer'].indexOf(b.role),
	);
};

function renderIcon(icon) {
	return () =>
		h(NIcon, null, {
			default: () => h(icon),
		});
}

const memberActionOptions = [
	{
		label: 'Remove full team',
		key: 'remove_team',
		disabled: true,
	},
	{
		label: 'Remove member',
		key: 'remove_member',
	},
];

const roleType = (role) => {
	switch (role) {
		case PROJECT_ROLE.OWNER:
			return 'warning';
		default:
			return 'info';
	}
};

const roleIcon = (role) => {
	switch (role) {
		case PROJECT_ROLE.OWNER:
			return Crown;
		case PROJECT_ROLE.EDITOR:
			return PenLine;
		default:
			return Eye;
	}
};

// Load initial data
onMounted(async () => {
	try {
		fetchProjectDetails();
		fetchAllUsers();
		fetchAllAgents();
	} catch (e) {
		console.error('Failed to load initial api data', e);
	}
});

const handleMemberAction = async (key, row) => {
	try {
		switch (key) {
			case 'remove_member':
				handleConfirm(row);
				break;
			case 'remove_team':
				break;
			default:
				console.error(`Unknown action key: ${key}`);
		}
	} catch (e) {
		console.error('handle action failed', e);
	}
};

function handleConfirm(row) {
	dialog.error({
		title: 'Deleting team / member',
		content: 'Are you sure ?',
		positiveText: 'Delete',
		negativeText: 'Cancel',
		draggable: true,
		onPositiveClick: () => {
			onRemoveMember(row.userId);
		},
		onNegativeClick: () => {},
	});
}

// ------------------- FETCH APIS -------------------
const fetchProjectDetails = () =>
	handleAction({
		action: () => getProjectDetails(projectId),
		onSuccess: (res) => {
			project.value = res?.[0];
		},
		onError: () => {
			router.push('/projects');
		},
	});

const fetchAllUsers = () =>
	handleAction({
		action: getAllUsers,
		onSuccess: (res) => {
			users.value = res || [];
		},
	});

const fetchAllAgents = () =>
	handleAction({
		action: () => getAllAgents(usersStore.currentUser.id),
		onSuccess: (res) => {
			agents.value = res || [];
		},
	});

// ------------------- ADD / UPDATE -------------------
const onAddMember = () =>
	handleAction({
		loadingRef: modalSubmitLoading,
		action: () => addMember(projectId, formValue.value),
		onSuccess: () => {
			showAddMemberModal.value = false;
			formValue.value = { users: [], role: null };
			fetchProjectDetails();
		},
	});

const onAddAgent = () =>
	handleAction({
		loadingRef: modalSubmitLoading,
		action: () => addAgent(projectId, formValue2.value),
		onSuccess: () => {
			showAddAgentModal.value = false;
			formValue2.value = { agentIds: [] };
			toast.showMessage({
				title: 'Project',
				message: 'Agents added successfully.',
				type: 'success',
			});
			fetchProjectDetails();
		},
		onError: (e) => {
			toast.showMessage({
				title: 'Project',
				message: e.message || 'Failed to add agent.',
				type: 'error',
			});
		},
	});

// ------------------- DELETE -------------------
const onRemoveAgent = (agentId) =>
	handleAction({
		action: () => removeAgent(projectId, agentId),
		onSuccess: () => {
			toast.showMessage({
				title: 'Project',
				message: 'Agent removed successfully.',
				type: 'success',
			});
			fetchProjectDetails();
		},
		onError: (e) => {
			toast.showMessage({
				title: 'Project',
				message: e.message || 'Failed to remove agent.',
				type: 'error',
			});
		},
	});

const onRemoveMember = (userId) =>
	handleAction({
		action: () => removeMember(projectId, userId),
		onSuccess: () => {
			fetchProjectDetails();
			toast.showMessage({
				title: 'Project',
				message: 'Member removed successfully.',
				type: 'success',
			});
		},
		onError: (e) => {
			toast.showMessage({
				title: 'Project',
				message: e.message || 'Failed to remove member.',
				type: 'error',
			});
		},
	});
</script>
