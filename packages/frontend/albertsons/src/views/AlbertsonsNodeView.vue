<script setup>
import { defineAsyncComponent, ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { handleAction } from '@src/utils/handleAction';
import { agentEditAccessCheck } from '@src/services/agents.service';
import { NEW_WORKFLOW_ID, PLACEHOLDER_EMPTY_WORKFLOW_ID } from '@/app/constants';
import { useUsersStore } from '@/features/settings/users/users.store';
const NodeView = defineAsyncComponent(() => import('@src/app/views/NodeView.vue'));

const route = useRoute();
const usersStore = useUsersStore();
const isViewer = ref(true);

const workflowId = computed(() => {
	const workflowIdParam = route.params.name;
	return [PLACEHOLDER_EMPTY_WORKFLOW_ID, NEW_WORKFLOW_ID].includes(workflowIdParam)
		? undefined
		: workflowIdParam;
});

watch(
	workflowId,
	(id) => {
		if (!id) return;

		handleAction({
			action: () => agentEditAccessCheck(id, usersStore.currentUser.id),
			onSuccess: (res) => {
				isViewer.value = res.isViewer;
			},
		});
	},
	{ immediate: true },
);
</script>

<template>
	<NodeView :isViewer="isViewer" />
</template>
