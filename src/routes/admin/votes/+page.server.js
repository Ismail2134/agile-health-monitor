import { loadQuestions } from '$lib/config.js';
import { surveyQuestions } from '$lib/config.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  const teams = await locals.pb.collection('teams').getFullList({ sort: 'team' });
  const sprints = await locals.pb.collection('sprints').getFullList({ sort: 'sprint' });
  const votes = await locals.pb.collection('team_health').getFullList({ sort: '-id' });
  const questions = structuredClone(locals.questions || []);

  return {
    teams: structuredClone(teams),
    sprints: structuredClone(sprints),
    votes: structuredClone(votes),
    questions
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  delete: async ({ request, locals }) => {
    const data = await request.formData();
    const recordId = data.get('id')?.toString();
    const team = data.get('team')?.toString();
    const sprint = data.get('sprint')?.toString();

    if (!recordId || !team || !sprint) return { error: 'Gegevens ontbreken.' };

    try {
      await locals.pb.collection('team_health').delete(recordId);

      const allVotes = await locals.pb.collection('team_health').getFullList({
        filter: `team = "${team}" && sprint = "${sprint}"`
      });

      const existingSummary = await locals.pb.collection('team_summary').getFullList({
        filter: `team = "${team}" && sprint = "${sprint}"`
      });

      if (allVotes.length === 0) {
        for (const s of existingSummary) {
          await locals.pb.collection('team_summary').delete(s.id);
        }
      } else {
        const summaryData = { team, sprint };
        for (const q of surveyQuestions) {
          const scores = allVotes.map(v => v[q.field]).filter(s => s != null);
          if (scores.length > 0) {
            summaryData[q.field] = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
          }
        }
        if (existingSummary.length > 0) {
          await locals.pb.collection('team_summary').update(existingSummary[0].id, summaryData);
        } else {
          await locals.pb.collection('team_summary').create(summaryData);
        }
      }

      return { success: 'Vote definitief verwijderd.' };
    } catch (err) {
      return { error: 'Fout bij verwijderen.' };
    }
  }
};
