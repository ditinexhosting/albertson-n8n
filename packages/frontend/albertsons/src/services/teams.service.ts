import { albertsonsRestApiRequest } from '@src/utils/albertsonsRestApiRequest';

/**
 * Fetch teams list for
 *
 * @returns Teams list
 */
export const getAllTeams = () => albertsonsRestApiRequest('GET', `/v1/teams/all`);

/**
 * Create team
 *
 * @param payload - Object
 * @returns success message
 */
export const createNewTeam = (payload: any) =>
	albertsonsRestApiRequest('POST', `/v1/teams/create`, payload);

/**
 * Delete team
 *
 * @param ownerId - ownerId
 * @param teamId - teamId
 * @returns success message
 */
export const deleteTeam = (teamId: string) =>
	albertsonsRestApiRequest('DELETE', `/v1/teams/${teamId}/delete`);

/**
 * Add team-members
 *
 * @param payload - [memberIds]
 * @returns success message
 */
export const addTeamMembers = (teamId: string, projectId: string, payload: any) =>
	albertsonsRestApiRequest('POST', `/v1/teams/${teamId}/add-members`, payload);

/**
 * Remove team-member
 *
 * @returns success message
 */
export const removeTeamMember = (teamId: string, userId: string) =>
	albertsonsRestApiRequest('DELETE', `/v1/teams/remove-member/${teamId}`);

/**
 * Attach team to project
 *
 * @param payload - Object
 * @returns success message
 */
export const attachTeamToProject = (teamId: string, projectId: string, payload: any) =>
	albertsonsRestApiRequest('POST', `/v1/teams/${teamId}/projects/${projectId}/members`, payload);

/**
 * De-attach team from project
 *
 * @param payload - Object
 * @returns success message
 */
export const deattachTeamFromProject = (teamId: string, projectId: string, payload: any) =>
	albertsonsRestApiRequest('DELETE', `/v1/teams/${teamId}/projects/${projectId}`, payload);
