/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  const teams = await locals.pb.collection('teams').getFullList();
  const sprints = await locals.pb.collection('sprints').getFullList();
  const users = await locals.pb.collection('users').getFullList();
  const votes = await locals.pb.collection('team_health').getFullList();

  return {
    teamCount: teams.length,
    sprintCount: sprints.length,
    userCount: users.length,
    voteCount: votes.length
  };
}
