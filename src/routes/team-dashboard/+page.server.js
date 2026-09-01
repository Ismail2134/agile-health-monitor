import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  if (!locals.user) {
    throw redirect(303, '/login');
  }

  const isAdmin = locals.isAdmin;
  const userTeams = (locals.user.team || '').split(', ').filter(Boolean);

  let teams = [];
  let sprints = [];
  let summaries = [];
  let allComments = [];

  try {
    teams = isAdmin
      ? await locals.pb.collection('teams').getFullList({ sort: 'team' })
      : [];

    sprints = isAdmin
      ? await locals.pb.collection('sprints').getFullList({ sort: 'sprint' })
      : await locals.pb.collection('sprints').getFullList({
          sort: 'sprint',
          filter: userTeams.map(t => `team = "${t}"`).join(' || ') || 'team = ""'
        });

    summaries = isAdmin
      ? await locals.pb.collection('team_summary').getFullList()
      : await locals.pb.collection('team_summary').getFullList({
          filter: userTeams.map(t => `team = "${t}"`).join(' || ') || 'team = ""'
        });

    allComments = isAdmin
      ? await locals.pb.collection('team_comments').getFullList()
      : await locals.pb.collection('team_comments').getFullList({
          filter: userTeams.map(t => `team = "${t}"`).join(' || ') || 'team = ""'
        });
  } catch { /* PocketBase niet beschikbaar */ }

  return {
    user: structuredClone(locals.user),
    isAdmin,
    userTeams: structuredClone(userTeams),
    teams: structuredClone(teams),
    sprints: structuredClone(sprints),
    summaries: structuredClone(summaries),
    allComments: structuredClone(allComments)
  };
}
