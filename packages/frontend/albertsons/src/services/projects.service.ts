import { albertsonsRestApiRequest } from '@src/utils/albertsonsRestApiRequest';

/**
 * Fetch project details by project id
 *
 * @param projectId - Unique project id
 * @returns Project details list
 */
export const getProjectDetails = (projectId: string) =>
	albertsonsRestApiRequest('GET', `/v1/projects/${projectId}`);

/**
 * Delete project by project id
 *
 * @param projectId - Unique project id
 * @returns success message
 */
export const deleteProject = (projectId: string) =>
	albertsonsRestApiRequest('DELETE', `/v1/projects/delete/${projectId}`);

/**
 * Fetch project list for logged in user
 *
 * @param userId - Unique user id
 * @returns Project list
 */
export const getAllProjects = (userId: string) =>
	albertsonsRestApiRequest('GET', `/v1/projects/all`, { userId });

/**
 * Map agents to project
 *
 * @param payload - Array of agentId(s)
 * @returns Mapped data Count(s)
 */
export const addAgentsToProject = (projectId: string, payload: any) =>
	albertsonsRestApiRequest('POST', `/v1/projects/${projectId}/add-agents`, payload);
