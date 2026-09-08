<script>
  import { getTrafficLightColor, getTrafficLightLabel } from '$lib/utils.js';
  import RadarChart from '$lib/components/RadarChart.svelte';
  import HealthGauge from '$lib/components/HealthGauge.svelte';

  /** @type {{ data: any }} */
  let { data } = $props();

  let isAdmin = $derived(data?.isAdmin ?? false);
  let userTeams = $derived(data?.userTeams ?? []);
  let selectedTeam = $state('');
  let showModal = $state(false);
  let modalSprint = $state(null);
  let modalQuestion = $state('');
  let modalComments = $state(null);
  let gaugeSprintId = $state('');

  $effect(() => {
    if (!isAdmin && userTeams.length > 0 && !selectedTeam) {
      selectedTeam = userTeams[0];
    }
  });

  let teams = $derived(data?.teams ?? []);
  let summaries = $derived(data?.summaries ?? []);
  let sprints = $derived(data?.sprints ?? []);

  let filteredSprints = $derived(
    selectedTeam
      ? sprints.filter(s => !s.team || s.team === selectedTeam)
      : sprints
  );

  let sprintMap = $derived(Object.fromEntries(sprints.map(s => [s.id, s.sprint])));

  let filteredSummaries = $derived(
    selectedTeam
      ? summaries.filter(s => s.team === selectedTeam)
      : summaries
  );

  let chartDatasets = $derived(
    selectedTeam
      ? filteredSummaries
          .filter(s => {
            for (const q of data.questions) {
              if (s[q.field] != null) return true;
            }
            return false;
          })
          .map(s => ({
            label: sprintMap[s.sprint] || s.sprint,
            ...Object.fromEntries(data.questions.map(q => [q.field, s[q.field]]))
          }))
      : []
  );

  let sprintSummaryMap = $derived(
    Object.fromEntries(
      sprints.map(sprint => {
        const summary = filteredSummaries.find(s => s.sprint === sprint.id);
        if (!summary) return [sprint.id, null];
        const scores = {};
        for (const q of data.questions) {
          scores[q.field] = summary[q.field] ?? null;
        }
        return [sprint.id, scores];
      })
    )
  );

  let commentMap = $derived(
    Object.fromEntries((data?.allComments ?? []).map(c => [c.sprint, c]))
  );

  function overallScore(s) {
    const vals = [];
    for (const q of data.questions) {
      const x = s[q.field];
      if (x != null) vals.push(x);
    }
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  let gaugeOptions = $derived(
    filteredSummaries
      .map(s => ({ id: s.sprint, name: sprintMap[s.sprint] || s.sprint, value: overallScore(s) }))
      .filter(o => o.value != null)
  );

  let selectedGauge = $derived(gaugeOptions.find(o => o.id === gaugeSprintId) ?? gaugeOptions[0] ?? null);

  $effect(() => {
    if (gaugeOptions.length > 0 && !gaugeOptions.some(o => o.id === gaugeSprintId)) {
      gaugeSprintId = gaugeOptions[0].id;
    } else if (gaugeOptions.length === 0) {
      gaugeSprintId = '';
    }
  });

  function hasComment(sprintId, field) {
    const record = commentMap[sprintId];
    if (!record) return false;
    const val = record[field + '_comment'];
    return !!(val && val.trim());
  }

  function openCommentsModal(sprintId, sprintName, questionName = '') {
    modalSprint = sprintName;
    modalQuestion = questionName;
    const commentRecord = data?.allComments?.find(c => c.sprint === sprintId);
    modalComments = commentRecord || null;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    modalSprint = null;
    modalQuestion = '';
    modalComments = null;
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') closeModal();
  }
</script>

<svelte:head>
  <title>Team Dashboard - Agile Health Monitor</title>
</svelte:head>

<div class="card p-6 sm:p-8">
  <h1 class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">Team Dashboard</h1>
  <div class="mb-5 flex flex-wrap gap-2">
    {#if !isAdmin}
      <a href="/team-dashboard/sessions" class="btn-secondary btn-xs no-underline">Vote sessies</a>
      <a href="/team-dashboard/teams" class="btn-secondary btn-xs no-underline">Teams beheren</a>
    {/if}
  </div>

  <div class="mb-6 max-w-xs">
    <label class="block">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Selecteer een team:</span>
      {#if isAdmin}
        <select bind:value={selectedTeam} class="input-field mt-1">
          <option value="">-- Alle teams --</option>
          {#each teams as team}
            <option value={team.team}>{team.team}</option>
          {/each}
        </select>
      {:else}
        <select bind:value={selectedTeam} class="input-field mt-1">
          {#each userTeams as t}
            <option value={t}>{t}</option>
          {/each}
        </select>
      {/if}
    </label>
  </div>

  {#if selectedTeam && chartDatasets.length > 0}
    <section class="mb-8">
      <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Spinnenwebdiagram &mdash; {selectedTeam}</h2>
      <RadarChart questions={data.questions} datasets={chartDatasets} size={560} chartMaxWidth={null}>
        {#snippet legendTop()}
          {#if gaugeOptions.length > 0}
            <div class="flex flex-col items-center rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Totale team health per sprint</span>
              <select bind:value={gaugeSprintId} class="input-field mt-1.5 w-full">
                {#each gaugeOptions as o}
                  <option value={o.id}>{o.name}</option>
                {/each}
              </select>
              {#if selectedGauge}
                <div class="mt-2">
                  <HealthGauge value={selectedGauge.value} size={170} />
                </div>
              {/if}
            </div>
          {/if}
        {/snippet}
      </RadarChart>
    </section>
  {/if}

  {#if filteredSummaries.length === 0}
    <div class="empty-state">
      <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Nog geen data beschikbaar</h3>
      <p class="mt-2 text-gray-500 dark:text-gray-400">Er zijn nog geen stemmen uitgebracht voor {selectedTeam ? `team "${selectedTeam}"` : 'de teams'}.</p>
      {#if isAdmin}
        <a href="/admin/sessions" class="btn-primary mt-4 inline-block no-underline">Maak stemsessie aan</a>
      {:else}
        <a href="/team-dashboard/sessions" class="btn-primary mt-4 inline-block no-underline">Maak stemsessie aan</a>
      {/if}
    </div>
  {:else}
    <div class="dashboard-table">
      <table class="traffic-light-table w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <thead>
          <tr>
            <th class="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              Categorie
            </th>
            {#each filteredSprints as sprint}
              <th class="clickable bg-gray-50 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700" onclick={() => openCommentsModal(sprint.id, sprint.sprint, '')} title="Klik voor comments">
                {sprint.sprint}
              </th>
            {/each}
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          {#each data.questions as q}
            <tr>
              <td class="sticky left-0 z-10 bg-white px-4 py-3 text-sm dark:bg-gray-900">
                <details class="inline-details">
                  <summary class="font-medium text-gray-900 dark:text-white">{q.question}</summary>
                  <div class="question-desc">
                    <span class="dot-sm green"></span>{q.good}<br/>
                    <span class="dot-sm red"></span>{q.bad}
                  </div>
                </details>
              </td>
              {#each filteredSprints as sprint}
                {@const scores = sprintSummaryMap[sprint.id]}
                {@const score = scores ? scores[q.field] : null}
                <td
                  class="clickable relative px-4 py-3 text-center text-sm font-semibold ring-1 ring-white transition-opacity hover:opacity-85"
                  style="background-color:{getTrafficLightColor(score)}; color:{score && score <= 2 ? '#000' : '#fff'};"
                  title={getTrafficLightLabel(score)}
                  onclick={() => openCommentsModal(sprint.id, sprint.sprint, q.question)}
                >
                  {score !== null ? score : '-'}
                  {#if hasComment(sprint.id, q.field)}
                    <span class="absolute top-0.5 right-0.5 text-xs leading-none" title="Heeft comment">&#x1F4AC;</span>
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <p class="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
      Klik op een sprint-kolom of cel om comments te bekijken.
    </p>
  {/if}
</div>

{#if showModal}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal-overlay" onclick={closeModal} onkeydown={handleKeydown} role="dialog" tabindex="-1">
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
  <div class="modal-content" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="document">
      <div class="flex items-start justify-between">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          {modalQuestion ? `Comment voor — ${modalQuestion}` : `Comments voor sprint: ${modalSprint}`}
        </h2>
        <button onclick={closeModal} class="btn-ghost rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Sluiten">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
        </button>
      </div>

      <div class="mt-5 space-y-4">
        {#if modalQuestion}
          {@const qObj = data.questions.find(q => q.question === modalQuestion)}
          {#if qObj}
            <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div class="mb-2 border-l-4 border-green-500 pl-3">
                <strong class="text-xs text-gray-900 dark:text-white"><span class="dot-sm green"></span> Goed:</strong>
                <p class="text-sm text-gray-600 dark:text-gray-400">{qObj.good}</p>
              </div>
              <div class="border-l-4 border-red-500 pl-3">
                <strong class="text-xs text-gray-900 dark:text-white"><span class="dot-sm red"></span> Slecht:</strong>
                <p class="text-sm text-gray-600 dark:text-gray-400">{qObj.bad}</p>
              </div>
            </div>
          {/if}
        {/if}
        {#if modalComments}
          {#each modalQuestion ? data.questions.filter(q => q.question === modalQuestion) : data.questions as q}
            {@const comment = modalComments[q.field + '_comment']}
            {#if comment}
              <div class="comment-block">
                <strong class="text-sm">{q.question}</strong>
                <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{comment}</p>
              </div>
            {/if}
          {/each}
        {:else}
          <p class="text-gray-500 dark:text-gray-400">Geen comments beschikbaar voor deze sprint.</p>
        {/if}
      </div>
    </div>
  </div>
{/if}
