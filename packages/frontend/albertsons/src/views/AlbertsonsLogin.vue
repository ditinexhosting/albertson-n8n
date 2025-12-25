<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import albertsonsLogo from '../assets/albertsons-logo.png';
import { NButton, NInput } from 'naive-ui';

import { useUsersStore } from '@/features/settings/users/users.store';
import { useUserSessionStore } from '../stores/userSession.js';

const router = useRouter();
const usersStore = useUsersStore();

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);
const sessionStore = useUserSessionStore();

const toggleMode = () => {
	isLogin.value = !isLogin.value;
	error.value = '';
	password.value = '';
	confirmPassword.value = '';
};

const handleSubmit = async () => {
	error.value = '';

	if (!email.value || !password.value) {
		error.value = 'Please fill in all fields';
		return;
	}

	if (!isLogin.value && password.value !== confirmPassword.value) {
		error.value = 'Passwords do not match';
		return;
	}

	// ⭐ FIX: mfaCode MUST BE EMPTY STRING, NOT NULL
	const payload = {
		emailOrLdapLoginId: email.value,
		password: password.value,
		mfaCode: '',
		mfaRecoveryCode: '',
	};

	try {
		loading.value = true;

		const result = await usersStore.loginWithCreds(payload);

		console.log('LOGIN SUCCESS →', result);

		await sessionStore.loadUser();

		loading.value = false;

		router.push('/dashboard');
	} catch (err) {
		console.error('LOGIN ERROR:', err);
		error.value = 'Invalid email or password';
		loading.value = false;
	}
};
</script>

<template>
	<div class="auth-page">
		<!-- Card -->
		<div class="auth-card">
			<div class="flex items-center justify-center gap-1.5">
				<img :src="albertsonsLogo" alt="Albertsons" class="h-8 w-8 object-contain shrink-0" />
				<div class="text-base font-bold text-primary">Albertsons</div>
			</div>
			<div class="my-4! h-px! bg-border-primary!" />

			<h2 class="text-xl! font-semibold! text-primary! pb-4!">
				{{ isLogin ? 'Sign in' : 'Create account' }}
			</h2>

			<form @submit.prevent="handleSubmit" class="auth-form">
				<!-- Email -->
				<div class="field">
					<label class="field-label">Email</label>
					<n-input
						v-model:value="email"
						type="email"
						size="large"
						placeholder="you@example.com"
						class="field-input"
					/>
				</div>

				<!-- Password -->
				<div class="field">
					<label class="field-label">Password</label>
					<n-input
						v-model:value="password"
						type="password"
						size="large"
						placeholder="••••••••"
						class="field-input"
					/>
				</div>

				<!-- Confirm password -->
				<div v-if="!isLogin" class="field">
					<label class="field-label">Confirm password</label>
					<n-input
						v-model:value="confirmPassword"
						type="password"
						size="large"
						placeholder="••••••••"
						class="field-input"
					/>
				</div>

				<!-- Error -->
				<p v-if="error" class="p-0.5! text-sm! text-warning-orange text-center">
					{{ error }}
				</p>

				<n-button type="primary" size="large" attr-type="submit" class="rounded-sm! my-2!">
					<span v-if="loading">Signing in...</span>
					<span v-else>{{ isLogin ? 'Sign in' : 'Create account' }}</span>
				</n-button>
			</form>

			<!-- Forgot -->
			<button
				v-if="isLogin"
				class="mt-3 font-normal! bg-transparent border-0 text-sm! text-primary cursor-pointer"
				type="button"
			>
				Forgot my password
			</button>

			<div class="my-4! h-px! bg-border-primary!" />

			<!-- Toggle -->
			<div class="text-sm text-secondary">
				<span v-if="isLogin">
					Don’t have an account?
					<button type="button" @click="toggleMode" class="link-inline">Create an account</button>
				</span>
				<span v-else>
					Already have an account?
					<button type="button" @click="toggleMode" class="link-inline">Sign in</button>
				</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
.auth-page {
	width: 100%;
	min-height: 100vh;
	background: var(--color-background-base);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

/* card */
.auth-card {
	width: 100%;
	max-width: 380px;
	background: var(--color-background-base);
	border-radius: 16px;
	padding: 25px 35px;
	border: 1px solid var(--color-border-base);
	box-shadow: 0 18px 45px rgba(0, 0, 0, 0.12);
	text-align: center;
}

/* form fields */
.auth-form {
	display: flex;
	flex-direction: column;
	gap: 14px;
	text-align: left;
}

.field {
	display: flex;
	flex-direction: column;
	gap: 4px;
	margin-bottom: 8px;
}

.field-label {
	font-size: 14px;
	color: var(--color-text-secondary);
	padding-bottom: 6px;
	font-weight: 600;
}

.field-input {
	border-radius: 8px;
	font-size: 14px;
}

.link-inline {
	background: transparent;
	border: none;
	color: var(--color-primary);
	font-weight: 500;
	cursor: pointer;
	text-decoration: underline;
}
</style>
