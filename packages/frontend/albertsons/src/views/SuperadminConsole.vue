<script setup>
import { ref, onMounted, watch, render, computed } from 'vue';
import {
	NIcon,
	NMenu,
	NButton,
	NModal,
	NCard,
	NGrid,
	NGi,
	NForm,
	NFormItem,
	NInput,
	NSelect,
	NDataTable,
	NSwitch,
	NDropdown,
} from 'naive-ui';
import { h } from 'vue';
import { RouterLink } from 'vue-router';
import { Users, FileLock, Pencil, LockKeyhole, MoreVertical } from 'lucide-vue-next';
import { ROUTERS } from '@src/utils/constants';
import { albertsonsRestApiRequest } from '@src/utils/albertsonsRestApiRequest';
import { useToast } from '@/app/composables/useToast';

const columns = createColumns();
const toast = useToast();
const showAddUserModal = ref(false);
const addingUser = ref(false);
const showEditUserModal = ref(false);
const isModalOpen = computed({
	get() {
		return showAddUserModal.value || showEditUserModal.value;
	},
	set(value) {
		showAddUserModal.value = value;
		showEditUserModal.value = value;
	},
});
const roles = ref([]);
const users = ref([]);
const addUserFormRef = ref(null);
const addUserFormValue = ref({
	ownerId: '',
	first_name: '',
	last_name: '',
	email: '',
	roleId: '',
});
const addUserFormRules = {
	first_name: {
		required: true,
		message: 'Please input your first name.',
		trigger: ['input', 'blur'],
	},
	last_name: {
		required: true,
		message: 'Please input your last name.',
		trigger: ['input', 'blur'],
	},
	email: {
		required: true,
		message: 'Please input your email.',
		type: 'email',
		trigger: ['input', 'blur'],
	},
	roleId: {
		required: true,
		message: 'Please select a role.',
		trigger: ['input', 'blur'],
	},
};

const menuOptions = [
	{
		label: () =>
			h(
				RouterLink,
				{
					to: {
						name: ROUTERS.SUPERADMIN_CONSOLE,
					},
				},
				{ default: () => 'Manage Users' },
			),
		key: 'superadmin-manage-user',
		icon: renderIcon(Users),
	},
	{
		label: 'Manage Credentials',
		key: 'superadmin-manage-credentials',
		disabled: true,
		icon: renderIcon(FileLock),
	},
];

const actionOptions = [
	{
		label: 'Edit',
		key: 'edit',
		icon: renderIcon(Pencil),
	},
	{
		label: 'Reset Password',
		key: 'reset-password',
		disabled: true,
		icon: renderIcon(LockKeyhole),
	},
];

function createColumns() {
	return [
		{
			title: 'First Name',
			key: 'owner.firstName',
		},
		{
			title: 'Last Name',
			key: 'owner.lastName',
		},
		{
			title: 'Email',
			key: 'owner.email',
		},
		{
			title: 'Role',
			key: 'role.label',
		},
		{
			title: 'Status',
			key: 'owner.disabled',
			render: (row) => {
				return h(
					NSwitch,
					{
						value: !row.owner?.disabled,
						disabled: row.owner?.roleSlug == 'global:owner',
						onUpdateValue: () => onUpdateUserStatus(row.id),
					},
					{
						checked: () => 'Active',
						unchecked: () => 'Inactive',
					},
				);
			},
		},
		{
			title: 'Action',
			key: 'actions',
			render: (row) => {
				return row.owner?.roleSlug == 'global:owner'
					? ''
					: h(
							NDropdown,
							{
								options: actionOptions,
								trigger: 'click',
								onSelect: (key) => handleAction(key, row),
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
function renderIcon(icon) {
	return () =>
		h(NIcon, null, {
			default: () => h(icon),
		});
}

// Load initial data
onMounted(async () => {
	try {
		const roleApiResult = await albertsonsRestApiRequest('GET', `/v1/user-roles/all`);
		if (roleApiResult) {
			const roleModel = roleApiResult.map((i) => ({ label: i.label, value: i.id }));
			roles.value = roleModel;
		}
		fetchAllUser();
	} catch (e) {
		console.error('Failed to load initial api data', e);
	}
});

const onUpdateUserStatus = async (id) => {
	try {
		users.value.find((user) => user.id === id).owner.disabled = !users.value.find(
			(user) => user.id === id,
		).owner.disabled;
		const apiResult = await albertsonsRestApiRequest(
			'POST',
			`/v1/user-metadata/toggle-user-activation`,
			{ ownerId: users.value.find((user) => user.id === id).owner.id },
		);
		if (apiResult) {
			toast.showMessage({
				title: `User`,
				message: 'User status updated successfully.',
				type: 'success',
			});
		}
	} catch (e) {
		users.value.find((user) => user.id === id).owner.disabled = !users.value.find(
			(user) => user.id === id,
		).owner.disabled;
		toast.showMessage({
			title: `User`,
			message: 'User status update failed.',
			type: 'success',
		});
		console.error('Failed to load initial api data', e);
	}
};

const fetchAllUser = async () => {
	try {
		const apiResult = await albertsonsRestApiRequest('GET', `/v1/user-metadata/all`);
		if (apiResult) {
			users.value = apiResult;
		}
	} catch (e) {
		console.error('Failed to load initial api data', e);
	}
};

const onAddUser = async () => {
	try {
		addingUser.value = true;
		const apiResult = await albertsonsRestApiRequest(
			'POST',
			`/v1/user-metadata/create`,
			addUserFormValue.value,
		);
		if (apiResult) {
			isModalOpen.value = false;
			addUserFormValue.value = {
				ownerId: '',
				first_name: '',
				last_name: '',
				email: '',
				roleId: '',
			};
			toast.showMessage({
				title: `User`,
				message: 'User created successfully.',
				type: 'success',
			});
			fetchAllUser();
		}
	} catch (e) {
		console.error('Failed to create user.', e.message, e);
		toast.showMessage({
			title: `User`,
			message: e.message || 'Failed to create user.',
			type: 'error',
		});
	} finally {
		addingUser.value = false;
	}
};

const onEditUser = async () => {
	try {
		addingUser.value = true;
		const apiResult = await albertsonsRestApiRequest(
			'POST',
			`/v1/user-metadata/update`,
			addUserFormValue.value,
		);
		if (apiResult) {
			isModalOpen.value = false;
			addUserFormValue.value = {
				ownerId: '',
				first_name: '',
				last_name: '',
				email: '',
				roleId: '',
			};
			toast.showMessage({
				title: `User`,
				message: 'User updated successfully.',
				type: 'success',
			});
			fetchAllUser();
		}
	} catch (e) {
		console.error('Failed to update user.', e.message, e);
		toast.showMessage({
			title: `User`,
			message: e.message || 'Failed to update user.',
			type: 'error',
		});
	} finally {
		addingUser.value = false;
	}
};

const handleAction = async (key, row) => {
	try {
		switch (key) {
			case 'edit':
				showEditUserModal.value = true;
				addUserFormValue.value = {
					ownerId: row.owner?.id,
					first_name: row.owner?.firstName,
					last_name: row.owner?.lastName,
					email: row.owner?.email,
					roleId: row.roleId,
				};
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
</script>

<template>
	<div class="flex flex-1 p-4! flex-col gap-4">
		<div>
			<div class="text-2xl font-bold mb-1!">Super Admin Console</div>
			<div class="text-base text-secondary">Manage users, credentials and other things.</div>
		</div>
		<div class="flex flex-row flex-1 gap-4">
			<div>
				<n-menu :options="menuOptions" value="superadmin-manage-user" />
			</div>
			<div class="flex-1 bg-white shadow rounded-lg p-4! border! border-border-primary!">
				<div class="flex flex-row items-center justify-between p-4!">
					<div>
						<div class="text-xl font-semibold mb-1!">Manage Users</div>
						<div class="text-xs text-secondary">Add, Edit, Deactivate users</div>
					</div>
					<n-button type="primary" @click="showAddUserModal = true">Add User</n-button>
				</div>
				<n-data-table :columns="columns" :data="users" />
			</div>
		</div>
		<n-modal
			v-model:show="isModalOpen"
			:mask-closable="false"
			preset="card"
			size="huge"
			style="width: 600px"
		>
			<template #header> {{ showEditUserModal ? 'Edit User' : 'Add User' }} </template>
			<n-form
				:ref="addUserFormRef"
				:rules="addUserFormRules"
				:label-width="80"
				:model="addUserFormValue"
				size="medium"
			>
				<n-grid x-gap="12" :cols="2">
					<n-gi>
						<n-form-item label="First Name" path="first_name">
							<n-input v-model:value="addUserFormValue.first_name" placeholder="First Name" />
						</n-form-item>
					</n-gi>
					<n-gi
						><n-form-item label="Last Name" path="last_name">
							<n-input
								v-model:value="addUserFormValue.last_name"
								placeholder="Last Name"
							/> </n-form-item
					></n-gi>
					<n-gi>
						<n-form-item label="Email" path="email">
							<n-input v-model:value="addUserFormValue.email" placeholder="Email" />
						</n-form-item>
					</n-gi>
					<n-gi>
						<n-form-item label="Role" path="roleId">
							<n-select v-model:value="addUserFormValue.roleId" :options="roles" />
						</n-form-item>
					</n-gi>
				</n-grid>
			</n-form>
			<template #footer>
				<div class="flex flex-row flex-1 gap-4 justify-end!">
					<n-button
						ghost
						type="primary"
						@click="
							showAddUserModal = false;
							showEditUserModal = false;
						"
						>Close</n-button
					>
					<n-button
						:loading="addingUser"
						type="primary"
						@click="showEditUserModal ? onEditUser() : onAddUser()"
						>Submit</n-button
					>
				</div>
			</template>
		</n-modal>
	</div>
</template>

<style scoped></style>
