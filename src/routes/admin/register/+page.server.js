import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  if (!locals.user) throw redirect(303, '/login');
  if (!locals.isAdmin) throw redirect(303, '/team-dashboard');

  const teams = await locals.pb.collection('teams').getFullList({ sort: 'team' });
  return {
    teams: structuredClone(teams)
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.isAdmin) throw redirect(303, '/login');

    const data = await request.formData();
    const username = data.get('username')?.toString().trim();
    const team = data.get('team')?.toString().trim();
    const password = data.get('password')?.toString();
    const passwordConfirm = data.get('passwordConfirm')?.toString();

    if (!username || !team || !password || !passwordConfirm) {
      return { error: 'Alle velden zijn verplicht.' };
    }

    if (password !== passwordConfirm) {
      return { error: 'Wachtwoorden komen niet overeen.' };
    }

    if (password.length < 8) {
      return { error: 'Wachtwoord moet minimaal 8 tekens bevatten.' };
    }

    try {
      await locals.pb.collection('users').create({
        username,
        email: `${username}@healthmonitor.app`,
        team,
        password,
        passwordConfirm
      });

      return { success: `Gebruiker "${username}" succesvol aangemaakt.` };
    } catch (err) {
      console.error('Registration error:', err);
      if (err?.data?.username?.code === 'validation_not_unique') {
        return { error: 'Deze gebruikersnaam is al in gebruik.' };
      }
      return { error: 'Registratie mislukt. Probeer opnieuw.' };
    }
  }
};
