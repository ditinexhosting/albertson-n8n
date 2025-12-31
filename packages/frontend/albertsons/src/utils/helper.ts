export function getProgressStatus(percentage) {
	if (percentage === 0) return 'default';
	if (percentage <= 30) return 'error';
	if (percentage <= 80) return 'warning';
	return 'success';
}
