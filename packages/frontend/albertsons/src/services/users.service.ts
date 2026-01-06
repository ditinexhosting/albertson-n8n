import { albertsonsRestApiRequest } from '@src/utils/albertsonsRestApiRequest';

/**
 * Fetch all users metadata
 *
 * @returns Users list
 */
export const getAllUsers = () => albertsonsRestApiRequest('GET', `/v1/user-metadata/all`);

/**
 * Fetch user's metadata
 *
 * @returns User metadata
 */
export const getUserMetadata = (ownerId: string) =>
	albertsonsRestApiRequest('GET', `/v1/user-metadata/${ownerId}`);

/**
 * Add members to a project
 *
 * @param projectId - Project id
 * @param payload - Member data (users, role)
 */
export const addMember = (projectId: string, payload: any) =>
	albertsonsRestApiRequest('POST', `/v1/projects/${projectId}/add-member`, payload);

/**
 * Remove member from project
 *
 * @param projectId - Project id
 * @param userId - User id
 */
export const removeMember = (projectId: string, userId: string) =>
	albertsonsRestApiRequest('DELETE', `/v1/projects/remove-member/${projectId}/${userId}`);
