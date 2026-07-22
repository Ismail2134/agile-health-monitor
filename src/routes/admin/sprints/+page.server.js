/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  const sprints = await locals.pb.collection('sprints').getFullList({ sort: 'sprint' });
  const teams = await locals.pb.collection('teams').getFullList({ sort: 'team' });
  return { sprints: structuredClone(sprints), teams: structuredClone(teams) };
}

/** @type {import('./$types').Actions} */
export const actions = {
  add: async ({ request, locals }) => {
    const data = await request.formData();
    const name = data.get('name')?.toString().trim();
    const team = data.get('team')?.toString().trim();
    if (!name || !team) return { error: 'Naam en team zijn verplicht.' };
    try {
      await locals.pb.collection('sprints').create({ sprint: name, team });
      return { success: `Sprint "${name}" toegevoegd aan ${team}.` };
    } catch (err) {
      return { error: 'Fout bij toevoegen. Bestaat deze sprint al?' };
    }
  },
  update: async ({ request, locals }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString();
    const name = data.get('name')?.toString().trim();
    const team = data.get('team')?.toString().trim();
    if (!id || !name || !team) return { error: 'ID, naam en team zijn verplicht.' };
    try {
      await locals.pb.collection('sprints').update(id, { sprint: name, team });
      return { success: `Sprint "${name}" bijgewerkt.` };
    } catch (err) {
      return { error: 'Fout bij bijwerken.' };
    }
  },
  delete: async ({ request, locals }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString();
    if (!id) return { error: 'ID is verplicht.' };
    try {
      let deleted = 0;
      for (const col of ['team_health', 'team_summary', 'team_comments', 'sessions']) {
        try {
          const records = await locals.pb.collection(col).getFullList({
            filter: `sprint = "${id}"`
          });
          for (const r of records) {
            await locals.pb.collection(col).delete(r.id);
            deleted++;
          }
        } catch {}
      }
      await locals.pb.collection('sprints').delete(id);
      return { success: `Sprint + ${deleted} gerelateerde records verwijderd.` };
    } catch (err) {
      return { error: 'Fout bij verwijderen.' };
    }
  }
};
