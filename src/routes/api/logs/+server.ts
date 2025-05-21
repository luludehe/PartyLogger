import type { RequestHandler } from '@sveltejs/kit';
import LogService from '../../../services/LogService';

export const GET: RequestHandler = async () => {
	try {
		const logs = await LogService.getAllLogs();
		return new Response(JSON.stringify(logs), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: 'Failed to fetch logs' }), { status: 500 });
	}
};