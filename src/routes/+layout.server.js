/** @type {import('./$types').LayoutServerLoad} */
export function load({ locals }) {
  return {
    user: locals.user ? structuredClone(locals.user) : null,
    isAdmin: locals.isAdmin ?? false,
    questions: structuredClone(locals.questions || [])
  };
}
