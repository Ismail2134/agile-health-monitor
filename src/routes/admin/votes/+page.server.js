import { loadQuestions } from '$lib/config.js';
import { surveyQuestions } from '$lib/config.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
  let teams = [];
  let sprints = [];
  let votes = [];
  try {
    teams = await locals.pb.collection('teams').getFullList({ sort: 'team' });
    sprints = await locals.pb.collection('sprints').getFullList({ sort: 'sprint' });
    votes = await locals.pb.collection('team_health').getFullList({ sort: '-id' });
  } catch { /* PocketBase niet beschikbaar */ }
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
        const existingComments = await locals.pb.collection('team_comments').getFullList({
          filter: `team = "${team}" && sprint = "${sprint}"`
        });
        for (const c of existingComments) {
          await locals.pb.collection('team_comments').delete(c.id);
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

        const commentsData = { team, sprint };
        for (const q of surveyQuestions) {
          const commentField = q.field + '_comment';
          const allComments = allVotes
            .map(v => v[commentField])
            .filter(c => c && c.trim());
          commentsData[commentField] = allComments.length > 0 ? allComments.join(' | ') : '';
        }
        const existingComments = await locals.pb.collection('team_comments').getFullList({
          filter: `team = "${team}" && sprint = "${sprint}"`
        });
        if (existingComments.length > 0) {
          await locals.pb.collection('team_comments').update(existingComments[0].id, commentsData);
        } else {
          await locals.pb.collection('team_comments').create(commentsData);
        }
      }

      return { success: 'Vote definitief verwijderd.' };
    } catch (err) {
      return { error: 'Fout bij verwijderen.' };
    }
  }
};
