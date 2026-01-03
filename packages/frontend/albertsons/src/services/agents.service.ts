import { albertsonsRestApiRequest } from '@src/utils/albertsonsRestApiRequest';

/**
 * Fetch all agent libries for current owner
 *
 * @param ownerId - Logged-in user id
 * @returns Agent Library list
 */
export const getAllAgentLibraries = (ownerId: string) =>
	albertsonsRestApiRequest('GET', `/v1/agent-library/all/${ownerId}`);

/**
 * Publish agent library
 *
 * @param payload - req data
 * @returns Unique Id for published entry
 */
export const publishAgentLib = (payload: any) =>
	albertsonsRestApiRequest('POST', `/v1/agent-library/publish`, payload);

/**
 * Install a agent lib
 *
 * @param agentLibId - Agent Lib Id
 */
export const installAgentLib = (agentLibId: string) =>
	albertsonsRestApiRequest('PUT', `/v1/agent-library/${agentLibId}/install`);

/****************** My agents apis *****************/
/**
 * Fetch all agents for current owner
 *
 * @param ownerId - Logged-in user id
 * @returns Agents list
 */
export const getAllAgents = (ownerId: string) =>
	albertsonsRestApiRequest('POST', '/v1/my-agents/all', { ownerId });

/**
 * Add agents to a project
 *
 * @param projectId - Project id
 * @param payload - Agent ids
 */
export const addAgent = (projectId: string, payload: any) =>
	albertsonsRestApiRequest('POST', `/v1/projects/${projectId}/add-agents`, payload);

/**
 * Remove agent from project
 *
 * @param projectId - Project id
 * @param agentId - Agent id
 */
export const removeAgent = (projectId: string, agentId: string) =>
	albertsonsRestApiRequest('DELETE', `/v1/projects/remove-agent/${projectId}/${agentId}`);

/**
 * Delete agent by agent id
 *
 * @param agentId - Unique project id
 * @returns success message
 */
export const deleteAgent = (agentId: string, workflowId: string) =>
	albertsonsRestApiRequest('DELETE', `/v1/my-agents/delete/${agentId}/${workflowId}`);
