import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  if (!locals.user) throw redirect(303, '/login');

  const userTeams = (locals.user.team || '').split(', ').filter(Boolean);
  const isAdmin = locals.isAdmin;

  const teams = isAdmin
    ? await locals.pb.collection('teams').getFullList({ sort: 'team' })
    : userTeams.map(t => ({ team: t }));

  const sprints = isAdmin
    ? await locals.pb.collection('sprints').getFullList({ sort: 'sprint' })
    : await locals.pb.collection('sprints').getFullList({
        sort: 'sprint',
        filter: userTeams.map(t => `team = "${t}"`).join(' || ') || 'team = ""'
      });

  const sessions = isAdmin
    ? await locals.pb.collection('sessions').getFullList({ sort: '-id' })
    : await locals.pb.collection('sessions').getFullList({
        sort: '-id',
        filter: userTeams.map(t => `team = "${t}"`).join(' || ') || 'team = ""'
      });

  const sprintMap = Object.fromEntries(sprints.map(s => [s.id, s.sprint]));

  return {
    sessions: structuredClone(sessions),
    teams: structuredClone(teams),
    sprints: structuredClone(sprints),
    sprintMap,
    isAdmin,
    userTeams: structuredClone(userTeams)
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  add: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, '/login');

    const data = await request.formData();
    const code = data.get('code')?.toString().trim();
    const team = data.get('team')?.toString().trim();
    const sprint = data.get('sprint')?.toString().trim();
    if (!code || !team || !sprint) return { error: 'Alle velden verplicht.' };
    if (code.length !== 6 || !/^\d{6}$/.test(code)) return { error: 'Code moet 6 cijfers zijn.' };

    const userTeams = (locals.user.team || '').split(', ').filter(Boolean);
    if (!locals.isAdmin && !userTeams.includes(team)) {
      return { error: 'Je kunt alleen sessies aanmaken voor je eigen teams.' };
    }

    try {
      const slug = crypto.randomUUID().slice(0, 8);
      await locals.pb.collection('sessions').create({
        code, team, sprint, active: true, slug, created_by: locals.user.id || ''
      });
      return { success: `Sessie "${code}" aangemaakt.` };
    } catch (err) {
      return { error: 'Fout bij aanmaken sessie.' };
    }
  },
  addSprint: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, '/login');
    const data = await request.formData();
    const name = data.get('name')?.toString().trim();
    const team = data.get('team')?.toString().trim();
    if (!name || !team) return { error: 'Team en sprintnaam zijn verplicht.' };

    const userTeams = (locals.user.team || '').split(', ').filter(Boolean);
    if (!locals.isAdmin && !userTeams.includes(team)) {
      return { error: 'Je kunt alleen sprints aanmaken voor je eigen teams.' };
    }

    try {
      await locals.pb.collection('sprints').create({ sprint: name, team });
      return { success: `Sprint "${name}" aangemaakt.` };
    } catch (err) {
      return { error: 'Fout bij aanmaken sprint.' };
    }
  },
  toggle: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, '/login');
    const data = await request.formData();
    const id = data.get('id')?.toString();
    const active = data.get('active') === 'true';
    if (!id) return { error: 'ID ontbreekt.' };
    try {
      await locals.pb.collection('sessions').update(id, { active });
      return { success: 'Sessie bijgewerkt.' };
    } catch { return { error: 'Fout bij bijwerken.' }; }
  },
  delete: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, '/login');
    const data = await request.formData();
    const id = data.get('id')?.toString();
    if (!id) return { error: 'ID ontbreekt.' };
    try {
      await locals.pb.collection('sessions').delete(id);
      return { success: 'Sessie verwijderd.' };
    } catch { return { error: 'Fout bij verwijderen.' }; }
  }
};
