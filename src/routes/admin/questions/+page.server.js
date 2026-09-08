/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  let questions = [];
  try {
    questions = await locals.pb.collection('questions').getFullList({ sort: 'order' });
  } catch { /* PocketBase niet beschikbaar */ }
  return { questions: structuredClone(questions) };
}

/** @type {import('./$types').Actions} */
export const actions = {
  update: async ({ request, locals }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString();
    const question = data.get('question')?.toString().trim();
    const good = data.get('good')?.toString().trim();
    const bad = data.get('bad')?.toString().trim();
    const order = parseInt(data.get('order')?.toString() || '1');

    if (!id || !question || !good || !bad) return { error: 'Verplichte velden ontbreken.' };

    try {
      const existing = await locals.pb.collection('questions').getOne(id);
      const field = existing.field;
      await locals.pb.collection('questions').update(id, { field, question, good, bad, order });
      return { success: 'Vraag bijgewerkt.' };
    } catch (err) {
      return { error: 'Fout bij bijwerken.' };
    }
  }
};
