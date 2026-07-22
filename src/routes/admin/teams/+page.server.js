/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  const teams = await locals.pb.collection('teams').getFullList({ sort: 'team' });
  return { teams: structuredClone(teams) };
}

/** @type {import('./$types').Actions} */
export const actions = {
  add: async ({ request, locals }) => {
    const data = await request.formData();
    const team = data.get('team')?.toString().trim();
    if (!team) return { error: 'Teamnaam is verplicht.' };
    try {
      await locals.pb.collection('teams').create({ team });
      return { success: `Team "${team}" toegevoegd.` };
    } catch (err) {
      return { error: 'Fout bij toevoegen. Bestaat dit team al?' };
    }
  },
  update: async ({ request, locals }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString();
    const newName = data.get('team')?.toString().trim();
    if (!id || !newName) return { error: 'Teamnaam is verplicht.' };
    try {
      const oldTeam = await locals.pb.collection('teams').getOne(id);
      const oldName = oldTeam.team;

      await locals.pb.collection('teams').update(id, { team: newName });

      if (oldName !== newName) {
        let migrated = 0;
        for (const col of ['team_health', 'team_summary', 'team_comments']) {
          try {
            const records = await locals.pb.collection(col).getFullList({
              filter: `team = "${oldName}"`
            });
            for (const r of records) {
              await locals.pb.collection(col).update(r.id, { team: newName });
              migrated++;
            }
          } catch {}
        }
        return { success: `Team hernoemd naar "${newName}" + ${migrated} records gemigreerd.` };
      }
      return { success: `Team "${newName}" bijgewerkt.` };
    } catch (err) {
      return { error: 'Fout bij bijwerken.' };
    }
  },
  delete: async ({ request, locals }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString();
    if (!id) return { error: 'ID is verplicht.' };
    try {
      await locals.pb.collection('teams').delete(id);
      return { success: 'Team verwijderd.' };
    } catch (err) {
      return { error: 'Fout bij verwijderen. Mogelijk heeft dit team nog stemmen of gebruikers.' };
    }
  }
};
