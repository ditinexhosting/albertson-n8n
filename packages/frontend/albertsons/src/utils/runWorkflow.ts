import { toRaw } from 'vue';
import { makeRestApiRequest } from '@n8n/rest-api-client';
import { useRootStore } from '@n8n/stores/useRootStore';
import { useToast } from '@/app/composables/useToast';

const toast = useToast();

export async function runWorkflow(router, workflow) {
	const rootStore = useRootStore();

	const triggerData = {
		workflowData: toRaw(workflow),
		triggerToStartFrom: { name: workflow?.nodes?.[0]?.name },
	};

	const triggerRes = await makeRestApiRequest(
		rootStore,
		'POST',
		`/rest/workflows/${workflow?.id}/run`,
		triggerData,
	);
	if (triggerRes?.executionId) {
		toast.showMessage({
			title: `Execution`,
			message: `Execution trigger with Id: ${triggerRes?.executionId}`,
			type: 'success',
		});
		router.push(`/workflow/${workflow?.id}/executions/${triggerRes?.executionId}`);
	}
}
