<template>
	<div class="flex flex-1 p-4! flex-col gap-4">
		<div class="flex flex-row items-center justify-between">
			<div>
				<div class="text-2xl font-bold mb-1!">Projects</div>
				<div class="text-base text-secondary">Manage your automation projects and agents.</div>
			</div>
			<n-button type="primary" @click="showAddProjectModal = true"
				><template #icon>
					<NIcon>
						<Plus />
					</NIcon> </template
				>Add Project</n-button
			>
		</div>
		<n-grid gap="4" :cols="4" v-for="project in projects" :key="project.id">
			<n-gi>
				<div class="shadow! hover:shadow-lg! border border-secondary rounded-lg p-4! bg-white!">
					<div class="flex justify-between items-center gap-4 mb-4!">
						<div class="text-ellipsis cursor-pointer text-secondary text-md break-all font-bold">
							{{ project.name }}
						</div>
						<n-dropdown
							class="cursor-pointer"
							trigger="click"
							:options="dotMenu"
							@select="handleAction"
						>
							<MoreVertical class="cursor-pointer" />
						</n-dropdown>
					</div>
					<n-space>
						<n-tag :type="statusType(project.status)" size="small" round class="font-semibold">
							{{ project.status }}
						</n-tag>
						<n-tag :type="roleType(project.role)" size="small" round class="font-semibold">
							<div class="flex items-center gap-2">
								<component :is="roleIcon(project.role)" size="16" />
								<div>{{ project.role }}</div>
							</div>
						</n-tag>
					</n-space>
					<n-divider />
					<div class="mb-4! text-secondary">{{ project?.description || '-' }}</div>
					<n-grid x-gap="2" :cols="3">
						<n-gi>
							<div class="text-xs flex items-center justify-start! gap-2">
								<GitBranch :size="14" />12 Agents
							</div>
						</n-gi>
						<n-gi>
							<div class="text-xs flex items-center justify-start! gap-2">
								<Play :size="14" /> 4521 Runs
							</div>
						</n-gi>
						<n-gi>
							<div class="text-xs flex items-center justify-start! gap-2">
								<Users :size="14" /> {{ project?.members?.length }} Members
							</div>
						</n-gi>
					</n-grid>
					<n-divider />
					<div class="flex flex-row justify-between items-center">
						<NAvatarGroup :options="memberOptions(project.members)" :size="40" :max="3">
							<template #avatar="{ option: { firstName, lastName } }">
								<n-tooltip>
									<template #trigger>
										<n-avatar color="#01529F">{{
											firstName?.charAt(0).toUpperCase() + ' ' + lastName?.charAt(0).toUpperCase()
										}}</n-avatar>
									</template>
									{{ name }}
								</n-tooltip>
							</template>
							<template>
								<n-avatar color="#01529F">+3</n-avatar>
							</template>
						</NAvatarGroup>
						<div class="text-secondary text-xs">
							Updated {{ dayjs(project.updatedAt).format('MMM DD, YYYY') }}
						</div>
					</div>
				</div>
			</n-gi>
		</n-grid>
		<n-modal
			v-model:show="showProjectModal"
			:mask-closable="false"
			preset="card"
			size="huge"
			style="width: 600px"
		>
			<template #header> {{ showEditProjectModal ? 'Edit Project' : 'Add Project' }} </template>
			<n-form :ref="formRef" :rules="formRules" :label-width="80" :model="formValue" size="medium">
				<n-grid x-gap="12" :cols="1">
					<n-gi>
						<n-form-item label="Name" path="name">
							<n-input v-model:value="formValue.name" placeholder="Name" />
						</n-form-item>
					</n-gi>
					<n-gi
						><n-form-item label="Description" path="description">
							<n-input
								v-model:value="formValue.description"
								type="textarea"
								placeholder="Description"
							/> </n-form-item
					></n-gi>
					<n-gi>
						<n-form-item label="Status" path="status">
							<n-select v-model:value="formValue.status" :options="projectStatus" />
						</n-form-item>
					</n-gi>
				</n-grid>
			</n-form>
			<template #footer>
				<div class="flex flex-row flex-1 gap-4 justify-end!">
					<n-button ghost type="primary" @click="showProjectModal = false">Close</n-button>
					<n-button
						:loading="modalSubmitLoading"
						type="primary"
						@click="showEditProjectModal ? onEdit() : onAdd()"
						>Submit</n-button
					>
				</div>
			</template>
		</n-modal>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
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
} from 'lucide-vue-next';
import { PROJECT_STATUS } from '@src/utils/constants';
import { useToast } from '@/app/composables/useToast';
import { albertsonsRestApiRequest } from '@src/utils/albertsonsRestApiRequest';
import { PROJECT_ROLE } from '@src/utils/constants';

const router = useRouter();
const showAddProjectModal = ref(false);
const showEditProjectModal = ref(false);
const modalSubmitLoading = ref(false);
const usersStore = useUsersStore();
const toast = useToast();
const showProjectModal = computed({
	get() {
		return showAddProjectModal.value || showEditProjectModal.value;
	},
	set(value) {
		showAddProjectModal.value = value;
		showEditProjectModal.value = value;
	},
});
const projectStatus = computed(() =>
	Object.values(PROJECT_STATUS).map((status) => ({
		label: status,
		value: status,
	})),
);
const formRef = ref(null);
const formValue = ref({
	ownerId: usersStore.currentUser?.id,
	projectId: null,
	name: '',
	description: '',
	status: PROJECT_STATUS.DRAFT,
});
const formRules = {
	name: {
		required: true,
		message: 'Please input your project name.',
		trigger: ['input', 'blur'],
	},
	description: {
		required: false,
	},
	status: {
		required: true,
		message: 'Please select project status.',
		trigger: ['input', 'blur'],
	},
};
const projects = ref([]);
const dotMenu = [
	{
		label: 'Edit',
		key: 'edit',
	},
	{
		label: 'Delete',
		key: 'delete',
	},
];

const memberOptions = (members) => {
	if (!members || members.length === 0) return [];

	return members.map((member) => ({
		firstName: member.firstName,
		lastName: member.lastName,
		src: '',
	}));
};

const statusType = (status) => {
	switch (status) {
		case PROJECT_STATUS.DRAFT:
			return 'info';
		case PROJECT_STATUS.ACTIVE:
			return 'success';
		case PROJECT_STATUS.INACTIVE:
			return 'error';
		default:
			return 'info';
	}
};

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
		fetchAllProjects();
	} catch (e) {
		console.error('Failed to load initial api data', e);
	}
});

const handleAction = async (key, row) => {
	try {
		switch (key) {
			case 'edit':
				// showEditUserModal.value = true;
				// addUserFormValue.value = {
				// 	ownerId: row.owner?.id,
				// 	first_name: row.owner?.firstName,
				// 	last_name: row.owner?.lastName,
				// 	email: row.owner?.email,
				// 	roleId: row.roleId,
				// };
				break;
			case 'reset-password':
				break;
			default:
				console.error(`Unknown action key: ${key}`);
		}
	} catch (e) {
		console.error('handle action failed', e);
	}
};

const fetchAllProjects = async () => {
	try {
		const apiResult = await albertsonsRestApiRequest('GET', `/v1/projects/all`, {
			userId: usersStore.currentUser?.id,
		});
		if (apiResult) {
			projects.value = apiResult;
		}
	} catch (e) {
		console.error('Failed to load initial api data', e);
	}
};

const onAdd = async () => {
	try {
		modalSubmitLoading.value = true;
		const apiResult = await albertsonsRestApiRequest(
			'POST',
			`/v1/projects/create`,
			formValue.value,
		);
		if (apiResult) {
			showProjectModal.value = false;
			formValue.value = {
				ownerId: usersStore.currentUser?.id,
				name: '',
				description: '',
				projectId: null,
				status: PROJECT_STATUS.DRAFT,
			};
			toast.showMessage({
				title: `Project`,
				message: 'Created successfully.',
				type: 'success',
			});
			fetchAllProjects();
		}
	} catch (e) {
		console.error('Failed to create project.', e.message, e);
		toast.showMessage({
			title: `Project`,
			message: e.message || 'Failed to create project.',
			type: 'error',
		});
	} finally {
		modalSubmitLoading.value = false;
	}
};

const onEdit = async () => {
	try {
		modalSubmitLoading.value = true;
		const apiResult = await albertsonsRestApiRequest(
			'POST',
			`/v1/projects/update/${formValue.value.projectId}`,
			formValue.value,
		);
		if (apiResult) {
			isModalOpen.value = false;
			formValue.value = {
				ownerId: usersStore.currentUser?.id,
				name: '',
				projectId: null,
				description: '',
				status: PROJECT_STATUS.DRAFT,
			};
			toast.showMessage({
				title: `Project`,
				message: 'Updated successfully.',
				type: 'success',
			});
			fetchAllUser();
		}
	} catch (e) {
		console.error('Failed to update project.', e.message, e);
		toast.showMessage({
			title: `Project`,
			message: e.message || 'Failed to update project.',
			type: 'error',
		});
	} finally {
		modalSubmitLoading.value = false;
	}
};
</script>
