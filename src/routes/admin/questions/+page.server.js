/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  const questions = await locals.pb.collection('questions').getFullList({ sort: 'order' });
  const maxOrder = questions.reduce((m, q) => Math.max(m, q.order || 0), 0);
  return { questions: structuredClone(questions), nextOrder: maxOrder + 1 };
}

/** @type {import('./$types').Actions} */
export const actions = {
  add: async ({ request, locals }) => {
    const data = await request.formData();
    const field = data.get('field')?.toString().trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const question = data.get('question')?.toString().trim();
    const good = data.get('good')?.toString().trim();
    const bad = data.get('bad')?.toString().trim();
    const order = parseInt(data.get('order')?.toString() || '1');

    if (!field || !question || !good || !bad) return { error: 'Alle velden zijn verplicht.' };
    try {
      await locals.pb.collection('questions').create({ field, question, good, bad, order });
      return { success: 'Vraag toegevoegd.' };
    } catch (err) {
      return { error: 'Fout bij toevoegen.' };
    }
  },
  update: async ({ request, locals }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString();
    const field = data.get('field')?.toString().trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const question = data.get('question')?.toString().trim();
    const good = data.get('good')?.toString().trim();
    const bad = data.get('bad')?.toString().trim();
    const order = parseInt(data.get('order')?.toString() || '1');

    if (!id || !field || !question) return { error: 'Verplichte velden ontbreken.' };
    try {
      await locals.pb.collection('questions').update(id, { field, question, good, bad, order });
      return { success: 'Vraag bijgewerkt.' };
    } catch (err) {
      return { error: 'Fout bij bijwerken.' };
    }
  },
  delete: async ({ request, locals }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString();
    if (!id) return { error: 'ID ontbreekt.' };
    try {
      const count = await locals.pb.collection('questions').getFullList({ fields: 'id' });
      if (count.length <= 3) return { error: 'Minstens 3 vragen verplicht.' };
      await locals.pb.collection('questions').delete(id);
      return { success: 'Vraag verwijderd.' };
    } catch (err) {
      return { error: 'Fout bij verwijderen.' };
    }
  }
};
