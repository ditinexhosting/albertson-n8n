import { defineStore } from 'pinia';
import { albertsonsRestApiRequest } from '@src/utils/albertsonsRestApiRequest';
import { useUsersStore } from '@/features/settings/users/users.store';

const usersStore = useUsersStore();

export const useUserAgentMappingsStore = defineStore('albertsonsUserAgentMappings', {
	state: () => ({
		userAgentMappings: [] as Array<any>,
	}),

	actions: {
		async fetchUserAgentMappings() {
			// IMPORTANT: await the request and log it
			// required: current logged‑in user id
			const ownerId = usersStore.currentUser?.id;

			const result = await albertsonsRestApiRequest('POST', '/v1/my-agents/all', {
				ownerId: ownerId,
			});

			// If backend returns { status, data }, match that shape
			if (result) {
				this.userAgentMappings = result;
			} else {
				this.userAgentMappings = [];
			}
		},

		getUserAgentMappings() {
			return this.userAgentMappings;
		},
	},
});
