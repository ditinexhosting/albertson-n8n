<script setup lang="ts">
import { ref } from 'vue';
import { NInput, NButton, NDivider } from 'naive-ui';
import { useRouter } from 'vue-router';
import { handleAction as handleActionAPI } from '@src/utils/handleAction';
import { updateProfle } from '@src/services/users.service';
import { useToast } from '@/app/composables/useToast';
import { useUsersStore } from '@/features/settings/users/users.store';

const { currentUser } = useUsersStore();
const router = useRouter();
const toast = useToast();
const loading = ref(false);
const formValue = ref({
	id: currentUser.id,
	name: currentUser.firstName + ' ' + currentUser.lastName,
	email: currentUser.email,
});

const formPasswordValue = ref({
	id: currentUser.id,
	currentPass: '',
	newPass: '',
	confirmNewPass: '',
});

const onUpdateProfile = (isUpdatingBasicInfo = true) => {
	if (!isUpdatingBasicInfo) {
		const { currentPass, newPass, confirmNewPass } = formPasswordValue.value;

		if (!currentPass.trim() || !newPass.trim() || !confirmNewPass.trim()) {
			toast.showMessage({
				title: 'Profile',
				message: 'All password fields are required.',
				type: 'error',
			});
			return;
		}

		if (newPass !== confirmNewPass) {
			toast.showMessage({
				title: 'Profile',
				message: 'New password and confirm password do not match.',
				type: 'error',
			});
			return;
		}
	}
	handleActionAPI({
		loadingRef: loading,
		action: () => updateProfle(isUpdatingBasicInfo ? formValue.value : formPasswordValue.value),
		onSuccess: (res) => {
			formValue.value = {
				id: currentUser.id,
				email: currentUser.email,
				name: res?.name,
			};
			formPasswordValue.value = {
				id: currentUser.id,
				currentPass: '',
				newPass: '',
				confirmNewPass: '',
			};
			toast.showMessage({
				title: `Profile`,
				message: isUpdatingBasicInfo
					? 'Account details updated successfully.'
					: 'Password updated successfully. Please log in again.',
				type: 'success',
			});

			if (!isUpdatingBasicInfo) router.push('/login');
		},
		onError: (e) => {
			let message = '';
			if (e.message === 'Current password is incorrect') {
				message = e.message;
			} else {
				message = isUpdatingBasicInfo
					? 'Failed to update account details.'
					: 'Failed to update password.';
			}
			toast.showMessage({
				title: `Profile`,
				message,
				type: 'error',
			});
		},
	});
};
</script>

<template>
	<div class="flex max-w-6xl p-4! flex-col gap-4 overflow-x-auto! h-[90vh]!">
		<!-- Account -->
		<section class="w-full md:w-lg">
			<!-- Header -->
			<div class="mb-6!">
				<div class="text-lg font-semibold mb-2">Account Details</div>
				<div class="text-sm text-secondary">Update your basic account information</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
				<div class="flex flex-col">
					<label class="text-sm font-medium mb-2!">Full Name</label>
					<n-input v-model:value="formValue.name" placeholder="Enter full name" />
				</div>

				<div class="flex flex-col">
					<label class="text-sm font-medium mb-2!">Email Address</label>
					<n-input v-model:value="formValue.email" disabled />
				</div>
			</div>

			<div class="flex justify-end mt-6!">
				<n-button class="rounded-md!" type="primary" @click="() => onUpdateProfile(true)">
					Save Changes
				</n-button>
			</div>
		</section>

		<n-divider />

		<!-- Security -->
		<section class="w-full md:w-lg">
			<div class="mb-6!">
				<div class="text-lg font-semibold mb-2">Security</div>
				<div class="text-sm text-secondary">Change your account password</div>
			</div>

			<div class="grid grid-cols-2 gap-5">
				<div class="flex flex-col">
					<label class="text-sm font-medium mb-2!">Current Password</label>
					<n-input
						placeholder="******"
						type="password"
						show-password-on="click"
						v-model:value="formPasswordValue.currentPass"
					/>
				</div>

				<div class="flex flex-col">
					<label class="text-sm font-medium mb-2!">New Password</label>
					<n-input
						placeholder="******"
						type="password"
						show-password-on="click"
						v-model:value="formPasswordValue.newPass"
					/>
				</div>

				<div class="flex flex-col">
					<label class="text-sm font-medium mb-2!">Confirm New Password</label>
					<n-input
						placeholder="******"
						type="password"
						show-password-on="click"
						v-model:value="formPasswordValue.confirmNewPass"
					/>
				</div>
			</div>

			<div class="flex justify-end mt-6!">
				<n-button class="rounded-md!" type="primary" @click="() => onUpdateProfile(false)">
					Update Password
				</n-button>
			</div>
		</section>
	</div>
</template>
