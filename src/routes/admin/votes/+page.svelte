<script>
  import { getScoreLabel, getScoreColor } from '$lib/utils.js';

  /** @type {{ data: any, form: any }} */
  let { data, form } = $props();

  let selectedTeam = $state('');
  let selectedSprint = $state('');
  let message = $state('');
  let errorMsg = $state('');

  $effect(() => {
    if (form?.success) { message = form.success; errorMsg = ''; }
    if (form?.error) { errorMsg = form.error; message = ''; }
  });

  let teams = $derived(data?.teams ?? []);
  let sprints = $derived(data?.sprints ?? []);
  let allVotes = $derived(data?.votes ?? []);

  let filteredVotes = $derived(
    allVotes.filter(v => {
      if (selectedTeam && v.team !== selectedTeam) return false;
      if (selectedSprint && v.sprint !== selectedSprint) return false;
      return true;
    })
  );

  function getSprintName(sprintId) {
    return sprints.find(s => s.id === sprintId)?.sprint ?? sprintId;
  }

  function confirmDelete(vote) {
    const name = vote.voter_name;
    const teamName = vote.team;
    const sprintName = getSprintName(vote.sprint);
    if (window.confirm(`Weet je het zeker? Vote van '${name}' (${teamName}, ${sprintName}) wordt definitief verwijderd.`)) {
      const form = document.getElementById('del-vote-' + vote.id);
      if (form) form.requestSubmit();
    }
  }
</script>

<svelte:head>
  <title>Votes bekijken - Admin</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Votes bekijken</h1>

{#if message}
  <div class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">{message}</div>
{/if}
{#if errorMsg}
  <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">{errorMsg}</div>
{/if}

<div class="mb-6 grid gap-4 sm:grid-cols-2">
  <label class="block">
    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Team filter</span>
    <select bind:value={selectedTeam} class="input-field mt-1">
      <option value="">Alle teams</option>
      {#each teams as t}
        <option value={t.team}>{t.team}</option>
      {/each}
    </select>
  </label>
  <label class="block">
    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Sprint filter</span>
    <select bind:value={selectedSprint} class="input-field mt-1">
      <option value="">Alle sprints</option>
      {#each sprints as s}
        <option value={s.id}>{s.sprint}</option>
      {/each}
    </select>
  </label>
</div>

<p class="mb-4 text-sm text-gray-500 dark:text-gray-400">{filteredVotes.length} votes gevonden</p>

{#if filteredVotes.length === 0}
  <div class="empty-state">
    <p>Geen votes gevonden met deze filters.</p>
  </div>
{:else}
  <div class="space-y-3">
    {#each filteredVotes as vote}
      <details class="rounded-xl border border-gray-200 dark:border-gray-700">
        <summary class="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 list-none [&::-webkit-details-marker]:hidden">
          <span>
            <strong>{vote.team}</strong> &mdash; Sprint {getSprintName(vote.sprint)} &mdash; <span class="text-gray-500 dark:text-gray-400">{vote.voter_name}</span>
          </span>
          <form method="POST" action="?/delete" id={'del-vote-' + vote.id} onsubmit={(e) => e.stopPropagation()}>
            <input type="hidden" name="id" value={vote.id} />
            <input type="hidden" name="team" value={vote.team} />
            <input type="hidden" name="sprint" value={vote.sprint} />
            <button
              type="button"
              class="ml-3 rounded px-1.5 py-0.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              title="Vote verwijderen"
              onclick={(e) => { e.stopPropagation(); confirmDelete(vote); }}
            >
              &times;
            </button>
          </form>
        </summary>
        <div class="overflow-x-auto border-t border-gray-200 dark:border-gray-700">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Categorie</th>
                <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Score</th>
                <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Opmerking</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              {#each data.questions as q}
                <tr>
                  <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">{q.question}</td>
                  <td class="px-4 py-2" style="background-color:{getScoreColor(vote[q.field])}; color:{vote[q.field] === 2 ? '#000' : '#fff'};">
                    <span class="text-sm font-semibold">{getScoreLabel(vote[q.field])}</span>
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{vote[q.field + '_comment'] || '-'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </details>
    {/each}
  </div>
{/if}
