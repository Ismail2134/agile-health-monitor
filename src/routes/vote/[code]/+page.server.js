import { surveyQuestions, loadQuestions } from '$lib/config.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
  const code = params.code;
  if (!/^\d{6}$/.test(code)) return { session: null };

  const sessions = await locals.pb.collection('sessions').getFullList({
    filter: `code = "${code}"`
  });

  if (sessions.length === 0) return { session: null };
  const session = sessions[0];

  const sprints = await locals.pb.collection('sprints').getFullList();
  const sprint = sprints.find(s => s.id === session.sprint);
  const sprintName = sprint?.sprint || session.sprint;

  const questions = await loadQuestions(locals.pb);

  return {
    session: structuredClone(session),
    sprintName,
    questions: structuredClone(questions)
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const sessionId = data.get('session_id')?.toString();
    const voterName = data.get('voter_name')?.toString().trim();
    const team = data.get('team')?.toString();
    const sprint = data.get('sprint')?.toString();

    if (!sessionId) return { error: 'Sessie ID ontbreekt.' };
    if (!voterName) return { error: 'Naam is verplicht.' };

    const record = { session: sessionId, voter_name: voterName, team, sprint };

    for (const q of surveyQuestions) {
      const val = data.get(q.field);
      if (val) record[q.field] = parseInt(val.toString());
      const comment = data.get(q.field + '_comment');
      if (comment && comment.toString().trim()) record[q.field + '_comment'] = comment.toString().trim();
    }

    const hasAll = surveyQuestions.every(q => record[q.field] !== undefined);
    if (!hasAll) return { error: 'Beantwoord alle 15 vragen.' };

    try {
      await locals.pb.collection('team_health').create(record);
      await updateTeamSummary(locals, team, sprint);
      return { success: true };
    } catch (err) {
      return { error: 'Fout bij opslaan.' };
    }
  }
};

async function updateTeamSummary(locals, team, sprintId) {
  const allVotes = await locals.pb.collection('team_health').getFullList({
    filter: `team = "${team}" && sprint = "${sprintId}"`
  });
  const summaryData = { team, sprint: sprintId };
  for (const q of surveyQuestions) {
    const scores = allVotes.map(v => v[q.field]).filter(s => s != null);
    if (scores.length > 0) {
      summaryData[q.field] = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
    }
  }
  const existing = await locals.pb.collection('team_summary').getFullList({
    filter: `team = "${team}" && sprint = "${sprintId}"`
  });
  if (existing.length > 0) {
    await locals.pb.collection('team_summary').update(existing[0].id, summaryData);
  } else {
    await locals.pb.collection('team_summary').create(summaryData);
  }
}
