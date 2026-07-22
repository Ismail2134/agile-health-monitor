import { error } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
  if (!locals.user) {
    throw error(401, 'Niet ingelogd.');
  }
  if (!locals.isAdmin) {
    throw error(403, 'Alleen voor admins.');
  }
  return {
    user: structuredClone(locals.user)
  };
}
