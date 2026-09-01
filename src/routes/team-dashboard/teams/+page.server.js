import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  if (!locals.user) throw redirect(303, '/login');

  const isAdmin = locals.isAdmin;
  const userId = locals.user.id;
  const userTeams = (locals.user.team || '').split(', ').filter(Boolean);

  let teams = [];
  try {
    teams = isAdmin
      ? await locals.pb.collection('teams').getFullList({ sort: 'team' })
      : await locals.pb.collection('teams').getFullList({
          sort: 'team',
          filter: userTeams.map(t => `team = "${t}"`).join(' || ') || 'team = ""'
        });
  } catch { /* PocketBase niet beschikbaar */ }

  return {
    teams: structuredClone(teams),
    isAdmin,
    userId,
    userTeams: structuredClone(userTeams)
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  add: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, '/login');

    const data = await request.formData();
    const team = data.get('team')?.toString().trim();
    if (!team) return { error: 'Teamnaam is verplicht.' };

    try {
      await locals.pb.collection('teams').create({
        team,
        created_by: locals.user.id
      });

      const currentTeams = (locals.user.team || '').split(', ').filter(Boolean);
      if (!currentTeams.includes(team)) {
        currentTeams.push(team);
        await locals.pb.collection('users').update(locals.user.id, {
          team: currentTeams.join(', ')
        });
      }

      return { success: `Team "${team}" toegevoegd aan je profiel.` };
    } catch (err) {
      return { error: 'Fout bij toevoegen. Bestaat dit team al?' };
    }
  },
  update: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, '/login');

    const data = await request.formData();
    const id = data.get('id')?.toString();
    const newName = data.get('team')?.toString().trim();
    if (!id || !newName) return { error: 'Teamnaam is verplicht.' };

    try {
      const team = await locals.pb.collection('teams').getOne(id);
      const oldName = team.team;

      if (!locals.isAdmin && team.created_by !== locals.user.id) {
        return { error: 'Je kunt alleen je eigen teams bewerken.' };
      }

      await locals.pb.collection('teams').update(id, { team: newName });

      if (oldName !== newName) {
        const allUsers = await locals.pb.collection('users').getFullList();
        for (const u of allUsers) {
          const userTeamList = (u.team || '').split(', ').filter(Boolean);
          const idx = userTeamList.indexOf(oldName);
          if (idx !== -1) {
            userTeamList[idx] = newName;
            await locals.pb.collection('users').update(u.id, { team: userTeamList.join(', ') });
          }
        }

        let migrated = 0;
        for (const col of ['team_health', 'team_summary', 'team_comments']) {
          try {
            const records = await locals.pb.collection(col).getFullList({ filter: `team = "${oldName}"` });
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
    if (!locals.user) throw redirect(303, '/login');

    const data = await request.formData();
    const id = data.get('id')?.toString();
    if (!id) return { error: 'ID is verplicht.' };

    try {
      const team = await locals.pb.collection('teams').getOne(id);

      if (!locals.isAdmin && team.created_by !== locals.user.id) {
        return { error: 'Je kunt alleen je eigen teams verwijderen.' };
      }

      await locals.pb.collection('teams').delete(id);

      const allUsers = await locals.pb.collection('users').getFullList();
      for (const u of allUsers) {
        const userTeamList = (u.team || '').split(', ').filter(Boolean).filter(t => t !== team.team);
        await locals.pb.collection('users').update(u.id, { team: userTeamList.join(', ') });
      }

      return { success: 'Team verwijderd en bij alle gebruikers weggehaald.' };
    } catch (err) {
      return { error: 'Fout bij verwijderen.' };
    }
  }
};
