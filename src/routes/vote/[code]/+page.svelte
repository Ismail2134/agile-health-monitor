<script>
  import { getPb } from '$lib/pocketbase.js';

  let { data, form } = $props();

  let voterName = $state('');
  let submitting = $state(false);
  let submitted = $state(false);
  let error = $state('');
  let session = $derived(data?.session);
  let questions = $derived(data?.questions ?? []);
  let sprintName = $derived(data?.sprintName ?? '');

  $effect(() => {
    if (form?.success) submitted = true;
    if (form?.error) error = form.error;
  });
</script>

<svelte:head><title>Votes - {sprintName}</title></svelte:head>

{#if !session}
  <div class="card p-8 text-center">
    <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Ongeldige code</h1>
    <p class="mb-5 text-gray-600 dark:text-gray-400">Deze sessie bestaat niet of is verlopen.</p>
    <a href="/vote" class="btn-primary inline-block py-2 px-6 no-underline">Opnieuw proberen</a>
  </div>
{:else if !session.active}
  <div class="card p-8 text-center">
    <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Sessie gesloten</h1>
    <p class="text-gray-600 dark:text-gray-400">Deze stemsessie is gesloten door de Scrum Master.</p>
  </div>
{:else if submitted}
  <div class="card p-8 text-center">
    <h1 class="mb-2 text-2xl font-bold text-green-600 dark:text-green-400">Bedankt!</h1>
    <p class="text-gray-600 dark:text-gray-400">Je stem is opgeslagen voor sprint <strong class="text-gray-900 dark:text-white">{sprintName}</strong>.</p>
    <p class="mt-1 text-sm text-gray-400 dark:text-gray-500">Team: {session.team}</p>
  </div>
{:else}
  <div class="card p-6 sm:p-8">
    <h1 class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">Team Health Check</h1>
    <p class="mb-5 text-sm text-gray-500 dark:text-gray-400">
      Team: <strong class="text-gray-900 dark:text-white">{session.team}</strong> &mdash; Sprint: <strong class="text-gray-900 dark:text-white">{sprintName}</strong>
    </p>

    {#if error}
      <div class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
        {error}
      </div>
    {/if}

    <form method="POST" class="space-y-5">
      <input type="hidden" name="session_id" value={session.id} />
      <input type="hidden" name="team" value={session.team} />
      <input type="hidden" name="sprint" value={session.sprint} />

      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Jouw naam (of pseudoniem):</span>
        <input type="text" name="voter_name" bind:value={voterName} required placeholder="Bijv. Jan, Anoniem, Teamlid 1" class="input-field mt-1" />
      </label>

      <hr class="border-gray-200 dark:border-gray-700" />

      <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Geef voor elke categorie aan hoe het gaat:</p>
      <div class="flex flex-wrap gap-4 text-xs font-medium">
        <span class="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-green-700 dark:bg-green-900 dark:text-green-300">Goed</span>
        <span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-700 dark:bg-amber-900 dark:text-amber-300">Matig</span>
        <span class="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-red-700 dark:bg-red-900 dark:text-red-300">Slecht</span>
      </div>

      {#each questions as q, i}
        <div class="voting-card">
          <strong class="text-gray-900 dark:text-white">{i + 1}. {q.question}</strong>
          <div class="question-desc mt-1 mb-3">
            <span class="dot-sm green"></span>{q.good}<br/>
            <span class="dot-sm red"></span>{q.bad}
          </div>
          <div class="radio-group mb-3">
            <label class="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 transition-colors cursor-pointer hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900">
              <input type="radio" name={q.field} value="1" required class="h-4 w-4 border-green-300 text-green-600 focus:ring-green-500 dark:border-green-700 dark:bg-green-900" />
              Goed
            </label>
            <label class="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 transition-colors cursor-pointer hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900">
              <input type="radio" name={q.field} value="2" class="h-4 w-4 border-amber-300 text-amber-600 focus:ring-amber-500 dark:border-amber-700 dark:bg-amber-900" />
              Matig
            </label>
            <label class="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors cursor-pointer hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900">
              <input type="radio" name={q.field} value="3" class="h-4 w-4 border-red-300 text-red-600 focus:ring-red-500 dark:border-red-700 dark:bg-red-900" />
              Slecht
            </label>
          </div>
          <details class="group rounded-lg border border-gray-200 dark:border-gray-700">
            <summary class="cursor-pointer px-3 py-1.5 text-xs text-gray-500 transition-colors group-open:bg-gray-50 dark:text-gray-400 dark:group-open:bg-gray-800 list-none [&::-webkit-details-marker]:hidden">
              Toelichting (optioneel)
            </summary>
            <input type="text" name={q.field + '_comment'} placeholder="Toelichting bij je keuze..." class="input-field m-2 w-[calc(100%-1rem)]" />
          </details>
        </div>
      {/each}

      <button type="submit" disabled={submitting} class="btn-primary w-full py-3 text-base">
        {submitting ? 'Opslaan...' : 'Stem indienen'}
      </button>
    </form>
  </div>
{/if}
