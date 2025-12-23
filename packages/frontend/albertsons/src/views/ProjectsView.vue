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
		<div class="flex flex-row"></div>
		{{ JSON.stringify(projects) }}
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
} from 'naive-ui';
import { Plus, Flame, Play, Users } from 'lucide-vue-next';
import { PROJECT_STATUS } from '@src/utils/constants';
import { useToast } from '@/app/composables/useToast';
import { albertsonsRestApiRequest } from '@src/utils/albertsonsRestApiRequest';

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

// Load initial data
onMounted(async () => {
	try {
		fetchAllProjects();
	} catch (e) {
		console.error('Failed to load initial api data', e);
	}
});

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
