import LogService from '../../services/LogService';
export async function load() {
	const logs = await LogService.getAllLogs();
	return { logs: logs };
}