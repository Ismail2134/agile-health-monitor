/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  let sessions = [];
  let teams = [];
  let sprints = [];
  try {
    sessions = await locals.pb.collection('sessions').getFullList({ sort: '-id' });
    teams = await locals.pb.collection('teams').getFullList({ sort: 'team' });
    sprints = await locals.pb.collection('sprints').getFullList({ sort: 'sprint' });
  } catch { /* PocketBase niet beschikbaar */ }
  const sprintMap = Object.fromEntries(sprints.map(s => [s.id, s.sprint]));
  return {
    sessions: structuredClone(sessions),
    teams: structuredClone(teams),
    sprints: structuredClone(sprints),
    sprintMap
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  add: async ({ request, locals }) => {
    const data = await request.formData();
    const code = data.get('code')?.toString().trim();
    const team = data.get('team')?.toString().trim();
    const sprint = data.get('sprint')?.toString().trim();
    if (!code || !team || !sprint) return { error: 'Alle velden verplicht.' };
    if (code.length !== 6 || !/^\d{6}$/.test(code)) return { error: 'Code moet 6 cijfers zijn.' };
    try {
      const slug = crypto.randomUUID().slice(0, 8);
      await locals.pb.collection('sessions').create({
        code, team, sprint, active: true, slug, created_by: locals.user?.id || ''
      });
      return { success: `Sessie "${code}" aangemaakt.` };
    } catch (err) {
      return { error: 'Fout bij aanmaken sessie.' };
    }
  },
  toggle: async ({ request, locals }) => {
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
    const data = await request.formData();
    const id = data.get('id')?.toString();
    if (!id) return { error: 'ID ontbreekt.' };
    try {
      await locals.pb.collection('sessions').delete(id);
      return { success: 'Sessie verwijderd.' };
    } catch { return { error: 'Fout bij verwijderen.' }; }
  }
};
