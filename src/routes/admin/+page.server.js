/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  let teamCount = 0;
  let sprintCount = 0;
  let userCount = 0;
  let voteCount = 0;

  try {
    teamCount = (await locals.pb.collection('teams').getFullList()).length;
    sprintCount = (await locals.pb.collection('sprints').getFullList()).length;
    userCount = (await locals.pb.collection('users').getFullList()).length;
    voteCount = (await locals.pb.collection('team_health').getFullList()).length;
  } catch { /* PocketBase niet beschikbaar */ }

  return { teamCount, sprintCount, userCount, voteCount };
}
