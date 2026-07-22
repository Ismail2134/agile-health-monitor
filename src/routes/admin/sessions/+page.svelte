<script>
  let { data, form } = $props();
  let message = $state(''); let errorMsg = $state('');
  $effect(() => {
    if (form?.success) { message = form.success; errorMsg = ''; }
    if (form?.error) { errorMsg = form.error; message = ''; }
  });
  function generateCode() {
    let c = '';
    for (let i = 0; i < 6; i++) c += Math.floor(Math.random() * 10);
    return c;
  }
  let newCode = $state(generateCode());
  let sessionTeam = $state('');
  let filteredSprints = $derived(
    sessionTeam ? (data?.sprints ?? []).filter(s => s.team === sessionTeam) : (data?.sprints ?? [])
  );
  let preselectSprint = $state('');

  $effect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('team') || '';
      const s = params.get('sprint') || '';
      if (t) sessionTeam = t;
      if (s) preselectSprint = s;
    }
  });

  function copyLink(code) {
    const url = window.location.origin + '/vote/' + code;
    navigator.clipboard.writeText(url).then(() => {
      message = 'Link gekopieerd: ' + url;
    });
  }
</script>

<svelte:head><title>Vote sessies - Admin</title></svelte:head>

<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Vote sessies</h1>

{#if message}
  <div class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">{message}</div>
{/if}
{#if errorMsg}
  <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">{errorMsg}</div>
{/if}

<details class="mb-6 rounded-xl border border-gray-200 dark:border-gray-700" open>
  <summary class="cursor-pointer rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 list-none [&::-webkit-details-marker]:hidden">
    + Nieuwe sessie aanmaken
  </summary>
  <form method="POST" action="?/add" class="space-y-4 border-t border-gray-200 p-4 dark:border-gray-700">
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Team</span>
        <select name="team" required bind:value={sessionTeam} class="input-field mt-1">
          <option value="">-- Selecteer team --</option>
          {#each data?.teams ?? [] as t}
            <option value={t.team}>{t.team}</option>
          {/each}
        </select>
      </label>
      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Sprint</span>
        <select name="sprint" required class="input-field mt-1">
          <option value="">-- Selecteer sprint --</option>
          {#each filteredSprints as s}
            <option value={s.id} selected={preselectSprint === s.id}>{s.sprint}</option>
          {/each}
        </select>
      </label>
    </div>
    <label class="block">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Code</span>
      <div class="mt-1 flex items-center gap-2">
        <input
          type="text"
          name="code"
          bind:value={newCode}
          required maxlength="6" pattern="[0-9]*" inputmode="numeric"
          class="w-48 rounded-lg border-2 border-gray-200 bg-gray-50 py-2.5 text-center text-2xl font-semibold tracking-[0.3em] text-gray-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          style="font-variant-numeric: tabular-nums;"
        />
        <button type="button" class="btn-secondary btn-sm" onclick={() => newCode = generateCode()}>
          Vernieuw
        </button>
      </div>
    </label>
    <button type="submit" class="btn-primary">Sessie aanmaken</button>
  </form>
</details>

<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Alle sessies ({data?.sessions?.length ?? 0})</h2>

<div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
  <table class="w-full">
    <thead>
      <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Code</th>
        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Team</th>
        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Sprint</th>
        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acties</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
      {#each data?.sessions ?? [] as s}
        <tr class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
          <td class="px-4 py-3">
            <span class="text-base font-bold tracking-[0.2em] text-gray-900 dark:text-white">{s.code}</span>
          </td>
          <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{s.team}</td>
          <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{data?.sprintMap?.[s.sprint] ?? s.sprint}</td>
          <td class="px-4 py-3">
            <form method="POST" action="?/toggle">
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="active" value={(!s.active).toString()} />
              <button type="submit" class={s.active ? 'badge badge-open' : 'badge badge-closed'} style="border:none;cursor:pointer;" title={s.active ? 'Klik om te sluiten' : 'Klik om te openen'}>
                {s.active ? 'Open' : 'Gesloten'}
              </button>
            </form>
          </td>
          <td class="px-4 py-3">
            <div class="flex gap-2">
              <button type="button" class="btn-secondary btn-xs" onclick={() => copyLink(s.code)}>Kopieer link</button>
              <a href="/admin/sessions/{s.slug}" class="btn-secondary btn-xs no-underline">Details</a>
              <a href="/vote/{s.code}" target="_blank" class="btn-secondary btn-xs no-underline">Starten</a>
              <form method="POST" action="?/delete" id={'del-ses-' + s.id}>
                <input type="hidden" name="id" value={s.id} />
                <button type="button" class="btn-danger btn-xs" onclick={() => {if(confirm('Sessie verwijderen?')) document.getElementById('del-ses-'+s.id).requestSubmit();}}>Verwijder</button>
              </form>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
