import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  if (!locals.user) {
    throw redirect(303, '/login');
  }

  const userTeams = (locals.user.team || '').split(', ').filter(Boolean);
  let teams = [];
  try {
    teams = await locals.pb.collection('teams').getFullList({
      sort: 'team',
      filter: userTeams.map(t => `team = "${t}"`).join(' || ') || 'team = ""'
    });
  } catch { /* PocketBase niet beschikbaar */ }

  return {
    user: structuredClone(locals.user),
    teams: structuredClone(teams)
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  updateProfile: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, '/login');

    const data = await request.formData();
    const username = data.get('username')?.toString().trim();
    const team = data.get('team')?.toString().trim();

    if (!username) {
      return { profileError: 'Gebruikersnaam is verplicht.' };
    }

    try {
      await locals.pb.collection('users').update(locals.user.id, {
        username,
        team
      });
      return { profileSuccess: 'Profiel succesvol bijgewerkt.' };
    } catch (err) {
      console.error('Profile update error:', err);
      if (err?.data?.username?.code === 'validation_not_unique') {
        return { profileError: 'Deze gebruikersnaam is al in gebruik.' };
      }
      return { profileError: 'Fout bij bijwerken profiel.' };
    }
  },

  changePassword: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, '/login');

    const data = await request.formData();
    const oldPassword = data.get('oldPassword')?.toString();
    const newPassword = data.get('newPassword')?.toString();
    const newPasswordConfirm = data.get('newPasswordConfirm')?.toString();

    if (!oldPassword || !newPassword || !newPasswordConfirm) {
      return { passwordError: 'Alle wachtwoordvelden zijn verplicht.' };
    }

    if (newPassword !== newPasswordConfirm) {
      return { passwordError: 'Nieuwe wachtwoorden komen niet overeen.' };
    }

    if (newPassword.length < 8) {
      return { passwordError: 'Nieuw wachtwoord moet minimaal 8 tekens bevatten.' };
    }

    try {
      await locals.pb.collection('users').update(locals.user.id, {
        oldPassword,
        password: newPassword,
        passwordConfirm: newPasswordConfirm
      });
      return { passwordSuccess: 'Wachtwoord succesvol gewijzigd.' };
    } catch (err) {
      console.error('Password change error:', err);
      return { passwordError: 'Fout bij wijzigen wachtwoord. Controleer je huidige wachtwoord.' };
    }
  }
};
