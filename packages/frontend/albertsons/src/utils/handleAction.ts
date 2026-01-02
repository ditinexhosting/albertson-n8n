/**
 * Generic helper to execute async actions with loading and error handling
 *
 * @param action - Function that performs the async operation (usually API call)
 * @param onSuccess - Callback executed when action succeeds
 * @param onError - Callback executed when action fails
 * @param loadingRef - Vue ref used to control loading state
 */
export async function handleAction({ action, onSuccess, onError, loadingRef }: any) {
	try {
		loadingRef && (loadingRef.value = true);
		const res = await action();
		onSuccess?.(res);
	} catch (e) {
		onError?.(e);
	} finally {
		loadingRef && (loadingRef.value = false);
	}
}
