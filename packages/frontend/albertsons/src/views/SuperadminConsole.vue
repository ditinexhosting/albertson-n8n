<script setup>
import { ref, onMounted, watch } from 'vue';
import { NIcon, NMenu } from 'naive-ui';
import { h } from 'vue';
import { RouterLink } from 'vue-router';
import { Users, FileLock } from 'lucide-vue-next';
import { ROUTERS } from '@src/utils/constants';

const STORAGE_KEY = 'superadmin_users';

const users = ref([]);
const showForm = ref(false);
const isEditing = ref(false);
const currentUser = ref({
	id: null,
	name: '',
	email: '',
	role: 'Manager',
	status: 'Active',
});

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

function renderIcon(icon) {
	return () =>
		h(NIcon, null, {
			default: () => h(icon),
		});
}

// Load from localStorage once
onMounted(() => {
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) {
				users.value = parsed;
			}
		}
	} catch (e) {
		console.error('Failed to load users from storage', e);
	}
});

// Persist whenever users change
watch(
	users,
	(newVal) => {
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
		} catch (e) {
			console.error('Failed to save users to storage', e);
		}
	},
	{ deep: true },
);

function openAddUser() {
	isEditing.value = false;
	currentUser.value = {
		id: null,
		name: '',
		email: '',
		role: 'Manager',
		status: 'Active',
	};
	showForm.value = true;
}

function openEditUser(user) {
	isEditing.value = true;
	currentUser.value = { ...user };
	showForm.value = true;
}

function saveUser() {
	if (!currentUser.value.name || !currentUser.value.email) return;

	if (isEditing.value && currentUser.value.id !== null) {
		users.value = users.value.map((u) =>
			u.id === currentUser.value.id ? { ...currentUser.value } : u,
		);
	} else {
		const nextId = users.value.length ? Math.max(...users.value.map((u) => u.id)) + 1 : 1;
		users.value.push({
			...currentUser.value,
			id: nextId,
			lastActive: 'Just now',
		});
	}
	showForm.value = false;
}

function deleteUser(id) {
	if (confirm('Delete this user?')) {
		users.value = users.value.filter((u) => u.id !== id);
	}
}
</script>

<template>
	<div class="flex flex-1 p-4! flex-col gap-4">
		<div>
			<div class="text-2xl font-bold mb-1!">Super Admin Console</div>
			<div class="text-base text-secondary">Manage users, credentials and other things.</div>
		</div>
		<div class="flex flex-row flex-1">
			<div>
				<n-menu :options="menuOptions" value="superadmin-manage-user" />
			</div>
			<div class="flex-1 bg-amber-400!"></div>
		</div>
	</div>
</template>

<style scoped></style>
