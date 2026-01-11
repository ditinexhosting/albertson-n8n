<script setup lang="ts">
import { ref } from 'vue';
import { NInput, NButton, NDivider } from 'naive-ui';

const fullName = ref('');
const email = ref('nishanthhs8@gmail.com');

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const saveProfile = () => {
	console.log('Profile updated');
};

const updatePassword = () => {
	if (newPassword.value !== confirmPassword.value) {
		alert('Passwords do not match');
		return;
	}
	console.log('Password updated');
};
</script>

<template>
	<div class="settings-container">
		<!-- Account -->
		<section class="settings-section">
			<h2 class="section-title">Account Details</h2>
			<p class="section-subtitle">Update your basic account information</p>

			<div class="form-row">
				<div class="form-field">
					<label>Full Name</label>
					<n-input v-model:value="fullName" placeholder="Enter full name" />
				</div>

				<div class="form-field">
					<label>Email Address</label>
					<n-input v-model:value="email" disabled />
				</div>
			</div>

			<div class="actions">
				<n-button type="primary" @click="saveProfile"> Save Changes </n-button>
			</div>
		</section>

		<n-divider />

		<!-- Security -->
		<section class="settings-section">
			<h2 class="section-title">Security</h2>
			<p class="section-subtitle">Change your account password</p>

			<div class="form-row">
				<div class="form-field">
					<label>Current Password</label>
					<n-input type="password" v-model:value="currentPassword" />
				</div>

				<div class="form-field">
					<label>New Password</label>
					<n-input type="password" v-model:value="newPassword" />
				</div>

				<div class="form-field">
					<label>Confirm New Password</label>
					<n-input type="password" v-model:value="confirmPassword" />
				</div>
			</div>

			<div class="actions">
				<n-button type="primary" @click="updatePassword"> Update Password </n-button>
			</div>
		</section>
	</div>
</template>

<style scoped>
.settings-container {
	max-width: 860px;
	padding: 32px;
}

/* Section */
.settings-section {
	margin-bottom: 24px;
}

.section-title {
	font-size: 16px;
	font-weight: 600;
	margin-bottom: 4px;
}

.section-subtitle {
	font-size: 13px;
	color: var(--color--text--shade-2);
	margin-bottom: 20px;
}

/* Form */
.form-row {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 20px;
}

.form-field {
	display: flex;
	flex-direction: column;
}

.form-field label {
	font-size: 13px;
	font-weight: 500;
	margin-bottom: 6px;
}

/* Actions */
.actions {
	display: flex;
	justify-content: flex-end;
	margin-top: 24px;
}
</style>
