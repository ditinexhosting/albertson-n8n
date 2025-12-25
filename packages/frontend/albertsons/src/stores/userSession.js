import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useUserSessionStore = defineStore('userSession', () => {
	const user = ref(null);
	const isLoaded = ref(false);

	async function loadUser() {
		try {
			// IMPORTANT: Must call n8n backend port 5678
			const res = await fetch('http://localhost:5678/rest/login', {
				credentials: 'include',
			});

			if (!res.ok) {
				console.error('Failed to load /rest/me');
				return;
			}

			const data = await res.json();
			user.value = data;

			console.log('User stored in userSession:', data);
		} catch (err) {
			console.error('Error loading user session:', err);
		} finally {
			isLoaded.value = true;
		}
	}

	async function logoutUser() {
		try {
			await fetch('http://localhost:5678/rest/logout', {
				method: 'POST',
				credentials: 'include',
			});
		} finally {
			user.value = null;
			isLoaded.value = true;
		}
	}

	return { user, isLoaded, loadUser, logoutUser };
});
