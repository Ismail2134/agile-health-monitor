import { surveyQuestions } from '$lib/config.js';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
  const slug = params.slug;
  let sessions;
  try {
    sessions = await locals.pb.collection('sessions').getFullList({
      filter: `slug = "${slug}"`
    });
  } catch {
    throw error(404, 'Sessie niet gevonden.');
  }
  if (sessions.length === 0) throw error(404, 'Sessie niet gevonden.');
  const session = sessions[0];

  let sprints = [];
  let healthRecords = [];
  try {
    sprints = await locals.pb.collection('sprints').getFullList();
    healthRecords = await locals.pb.collection('team_health').getFullList({
      filter: `session = "${session.id}"`,
      sort: '-id'
    });
  } catch { /* PocketBase niet beschikbaar */ }

  const sprint = sprints.find(s => s.id === session.sprint);
  const sprintName = sprint?.sprint || session.sprint;

  const questions = locals.questions && locals.questions.length > 0 ? locals.questions : surveyQuestions;

  const voterSet = new Set();
  const matrix = {};
  const comments = [];
  const voterData = {};
  const voterRecords = {};

  for (const q of questions) {
    matrix[q.field] = {};
  }

  for (const record of healthRecords) {
    const voter = record.voter_name || 'Anoniem';
    voterSet.add(voter);
    voterRecords[voter] = record.id;

    if (!voterData[voter]) {
      voterData[voter] = { label: voter };
    }

    for (const q of questions) {
      if (record[q.field] != null) {
        matrix[q.field][voter] = record[q.field];
        voterData[voter][q.field] = record[q.field];
      }
      const c = record[q.field + '_comment'];
      if (c && c.trim()) {
        comments.push({
          voter,
          question: q.question,
          score: record[q.field],
          text: c.trim()
        });
      }
    }
  }

  const voterDatasets = Object.values(voterData).filter(d => {
    for (const q of questions) {
      if (d[q.field] != null) return true;
    }
    return false;
  });

  return {
    session: structuredClone(session),
    sprintName,
    questions: structuredClone(questions),
    voters: [...voterSet],
    matrix: structuredClone(matrix),
    comments: structuredClone(comments),
    voterDatasets: structuredClone(voterDatasets),
    voterRecords: structuredClone(voterRecords)
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  deleteVote: async ({ request, locals }) => {
    const data = await request.formData();
    const recordId = data.get('recordId')?.toString();
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

      return { success: true };
    } catch (err) {
      return { error: 'Fout bij verwijderen.' };
    }
  }
};
