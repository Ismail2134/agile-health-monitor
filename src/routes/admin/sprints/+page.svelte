<script>
  /** @type {{ data: any, form: any }} */
  let { data, form } = $props();

  let editId = $state('');
  let editName = $state('');
  let editTeam = $state('');
  let message = $state('');
  let errorMsg = $state('');
  let filterTeam = $state('');

  $effect(() => {
    if (form?.success) { message = form.success; errorMsg = ''; }
    if (form?.error) { errorMsg = form.error; message = ''; }
  });

  function startEdit(sprint) {
    editId = sprint.id;
    editName = sprint.sprint;
    editTeam = sprint.team || '';
  }

  function cancelEdit() {
    editId = '';
    editName = '';
    editTeam = '';
  }

  let teams = $derived(data?.teams ?? []);
  let allSprints = $derived(data?.sprints ?? []);
  let filteredSprints = $derived(
    filterTeam ? allSprints.filter(s => s.team === filterTeam) : allSprints
  );

  function confirmDelete(sprint) {
    if (window.confirm("Weet je het zeker? Dit verwijdert sprint \"" + sprint.sprint + "\" en ALLE bijbehorende stemmen, resultaten, comments en sessies.")) {
      const form = document.getElementById('delete-' + sprint.id);
      if (form) form.requestSubmit();
    }
  }
</script>

<svelte:head>
  <title>Sprints beheren - Admin</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Sprints beheren</h1>

{#if message}
  <div class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">{message}</div>
{/if}
{#if errorMsg}
  <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">{errorMsg}</div>
{/if}

<div class="mb-5 space-y-3">
  <details class="rounded-xl border border-gray-200 dark:border-gray-700" open>
    <summary class="cursor-pointer rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 list-none [&::-webkit-details-marker]:hidden">
      + Nieuwe sprint toevoegen
    </summary>
    <form method="POST" action="?/add" class="space-y-4 border-t border-gray-200 p-4 dark:border-gray-700">
      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Team</span>
        <select name="team" required class="input-field mt-1">
          <option value="">-- Selecteer team --</option>
          {#each teams as t}
            <option value={t.team}>{t.team}</option>
          {/each}
        </select>
      </label>
      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Sprint naam (bijv. S26-01)</span>
        <input type="text" name="name" required maxlength="50" placeholder="S26-01" class="input-field mt-1" />
      </label>
      <button type="submit" class="btn-primary">Toevoegen</button>
    </form>
  </details>

  {#if editId}
    <details class="rounded-xl border border-gray-200 dark:border-gray-700" open>
      <summary class="cursor-pointer rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 list-none [&::-webkit-details-marker]:hidden">
        Sprint bewerken
      </summary>
      <form method="POST" action="?/update" class="space-y-4 border-t border-gray-200 p-4 dark:border-gray-700">
        <input type="hidden" name="id" value={editId} />
        <label class="block">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Team</span>
          <select name="team" bind:value={editTeam} class="input-field mt-1">
            {#each teams as t}
              <option value={t.team}>{t.team}</option>
            {/each}
          </select>
        </label>
        <label class="block">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Sprint naam</span>
          <input type="text" name="name" bind:value={editName} required maxlength="50" class="input-field mt-1" />
        </label>
        <div class="flex gap-2">
          <button type="submit" class="btn-primary">Opslaan</button>
          <button type="button" class="btn-secondary" onclick={cancelEdit}>Annuleren</button>
        </div>
      </form>
    </details>
  {/if}
</div>

<div class="flex items-center justify-between">
  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Sprinte ({filteredSprints.length})</h2>
  <div class="w-48">
    <select bind:value={filterTeam} class="input-field text-sm">
      <option value="">Alle teams</option>
      {#each teams as t}
        <option value={t.team}>{t.team}</option>
      {/each}
    </select>
  </div>
</div>

<div class="mt-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
  <table class="w-full">
    <thead>
      <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Sprint</th>
        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Team</th>
        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acties</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
      {#each filteredSprints as sprint}
        <tr class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
          <td class="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{sprint.sprint}</td>
          <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{sprint.team || '-'}</td>
          <td class="px-4 py-3">
            <div class="flex gap-2">
              <button class="btn-secondary btn-xs" onclick={() => startEdit(sprint)}>Bewerk</button>
              <form method="POST" action="?/delete" id={'delete-' + sprint.id}>
                <input type="hidden" name="id" value={sprint.id} />
                <button type="button" class="btn-danger btn-xs" onclick={() => confirmDelete(sprint)}>Verwijder</button>
              </form>
              <a href="/admin/sessions?team={encodeURIComponent(sprint.team || '')}&sprint={sprint.id}" class="btn-secondary btn-xs whitespace-nowrap no-underline">Vote sessie aanmaken</a>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
