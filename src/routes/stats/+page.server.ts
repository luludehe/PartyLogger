import StatService from '../../services/StatService';
export async function load() {
	const ticketsByHour = await StatService.getTicketsByHour();
	const studentsTickets = await StatService.getStudentsWithTickets();
	const studentsCount = await StatService.getStudentsCount();
	const guestsTickets = await StatService.getGuestsWithTickets();
	const guestsCount = await StatService.getGuestsCount();
	return { ticketsByHour, studentsTickets, studentsCount, guestsTickets, guestsCount };
}