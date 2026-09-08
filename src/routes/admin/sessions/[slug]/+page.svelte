<script>
  import QRCode from '$lib/components/QRCode.svelte';
  import RadarChart from '$lib/components/RadarChart.svelte';

  let { data } = $props();
  let session = $derived(data?.session);
  let questions = $derived(data?.questions ?? []);
  let voters = $derived(data?.voters ?? []);
  let matrix = $derived(data?.matrix ?? {});
  let comments = $derived(data?.comments ?? []);
  let sprintName = $derived(data?.sprintName ?? '');
  let voterDatasets = $derived(data?.voterDatasets ?? []);
  let voterRecords = $derived(data?.voterRecords ?? {});
  let voteUrl = $derived(typeof window !== 'undefined' ? window.location.origin + '/vote/' + session?.code : '');

  function cellColor(s) {
    if (s == null) return 'transparent';
    if (s <= 1.5) return '#22c55e';
    if (s <= 2.5) return '#f59e0b';
    return '#ef4444';
  }

  function cellText(s) {
    if (s == null) return '-';
    return s.toFixed(1);
  }

  let voterComments = $derived(
    Object.fromEntries(voters.map(v => [v, comments.filter(c => c.voter === v)]))
  );
</script>

<svelte:head><title>Sessie {session?.code} - Admin</title></svelte:head>

<h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Sessie: {session?.code}</h1>
<p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
  Team: <strong class="text-gray-900 dark:text-white">{session?.team}</strong> &mdash;
  Sprint: <strong class="text-gray-900 dark:text-white">{sprintName}</strong> &mdash;
  Status:
  <span class="font-semibold" class:text-green-500={session?.active} class:text-red-500={!session?.active}>
    {session?.active ? 'Open' : 'Gesloten'}
  </span>
</p>

{#if session?.active}
  <div class="card mb-8 p-6 text-center">
    <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Deel deze code met je team</h3>
    <div class="my-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.5em] text-brand-600 dark:text-brand-400">{session.code}</div>
    <p class="mb-4 text-sm text-gray-500 dark:text-gray-400">of scan de QR-code:</p>
    <div class="inline-block">
      <QRCode url={voteUrl || ''} size={200} />
    </div>
    <p class="mt-4 text-xs text-gray-400 dark:text-gray-500">
      Link: <a href={voteUrl} class="text-brand-600 hover:text-brand-500 dark:text-brand-400">{voteUrl}</a>
    </p>
    <button type="button" class="btn-secondary mt-3" onclick={() => { navigator.clipboard.writeText(voteUrl); alert('Gekopieerd!'); }}>
      Kopieer link
    </button>
  </div>
{/if}

<h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">Resultaten ({voters.length} stemmers)</h2>

{#if voters.length === 0}
  <p class="text-gray-500 dark:text-gray-400">Nog geen stemmen uitgebracht.</p>
{:else}
  {#if voterDatasets.length > 0}
    <section class="mb-8">
      <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Spinnenwebdiagram per teamlid</h3>
      <RadarChart questions={questions} datasets={voterDatasets} size={560} />
    </section>
  {/if}

  <div class="dashboard-table mb-6">
    <table class="traffic-light-table w-full border-separate border-spacing-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <thead>
        <tr>
          <th class="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            Categorie
          </th>
          {#each voters as voter}
            <th class="bg-gray-50 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800 dark:text-gray-400" style="max-width:100px;" title={voter}>
              <span class="block truncate max-w-[80px]">{voter}</span>
              {#if voterRecords[voter]}
                <form method="POST" action="?/deleteVote" class="mt-1">
                  <input type="hidden" name="recordId" value={voterRecords[voter]} />
                  <input type="hidden" name="team" value={session?.team ?? ''} />
                  <input type="hidden" name="sprint" value={session?.sprint ?? ''} />
                  <button type="submit"
                    class="rounded px-1 py-0 sm:px-2 sm:py-1 text-[10px] sm:text-sm text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                    title="Stem verwijderen"
                    onclick={(e) => { if (!confirm('Stem van ' + voter + ' verwijderen?')) e.preventDefault(); }}
                  >
                    &times;
                  </button>
                </form>
              {/if}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        {#each questions as q}
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
            {#each voters as voter}
              {@const score = matrix[q.field]?.[voter]}
              <td class="px-3 py-3 text-center text-sm font-semibold" style="background-color:{cellColor(score)}; color:{score != null && score <= 2 ? '#000' : '#fff'};">
                {cellText(score)}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if comments.length > 0}
    <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Opmerkingen</h3>
    <div class="space-y-3">
      {#each voters as voter}
        {#if voterComments[voter]?.length > 0}
          <details class="rounded-xl border border-gray-200 dark:border-gray-700">
            <summary class="cursor-pointer px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 list-none [&::-webkit-details-marker]:hidden">
              {voter} ({voterComments[voter].length} opmerkingen)
            </summary>
            <div class="space-y-3 border-t border-gray-200 p-4 dark:border-gray-700">
              {#each voterComments[voter] as c}
                <div class="comment-block">
                  <strong class="text-sm">{c.question}</strong> &mdash;
                  <span class="dot-sm" style="background-color:{cellColor(c.score)}"></span>
                  <small class="text-sm text-gray-600 dark:text-gray-400">{c.text}</small>
                </div>
              {/each}
            </div>
          </details>
        {/if}
      {/each}
    </div>
  {/if}
{/if}
