import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  if (locals.user) {
    throw redirect(303, '/team-dashboard');
  }
  return {};
}

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const username = data.get('username')?.toString().trim();
    const password = data.get('password')?.toString();

    if (!username || !password) {
      return { error: 'Gebruikersnaam en wachtwoord zijn verplicht.' };
    }

    try {
      await locals.pb.collection('users').authWithPassword(username, password);
      throw redirect(303, '/team-dashboard');
    } catch (err) {
      if (err.status === 303) throw err;
      return { error: 'Ongeldige gebruikersnaam of wachtwoord.' };
    }
  }
};
