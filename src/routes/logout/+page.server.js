import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  locals.pb.authStore.clear();
  throw redirect(303, '/');
}
