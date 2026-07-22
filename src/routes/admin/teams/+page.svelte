<script>
  /** @type {{ data: any, form: any }} */
  let { data, form } = $props();

  let editId = $state('');
  let editName = $state('');
  let message = $state('');
  let errorMsg = $state('');

  $effect(() => {
    if (form?.success) { message = form.success; errorMsg = ''; }
    if (form?.error) { errorMsg = form.error; message = ''; }
  });

  function startEdit(team) {
    editId = team.id;
    editName = team.team;
  }

  function cancelEdit() {
    editId = '';
    editName = '';
  }

  function confirmDelete(team) {
    if (window.confirm("Team '" + team.team + "' verwijderen?")) {
      const form = document.getElementById('delete-' + team.id);
      if (form) form.requestSubmit();
    }
  }
</script>

<svelte:head>
  <title>Teams beheren - Admin</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Teams beheren</h1>

{#if message}
  <div class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">{message}</div>
{/if}
{#if errorMsg}
  <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">{errorMsg}</div>
{/if}

<div class="mb-5 space-y-3">
  <details class="rounded-xl border border-gray-200 dark:border-gray-700">
    <summary class="cursor-pointer rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 list-none [&::-webkit-details-marker]:hidden">
      + Nieuw team toevoegen
    </summary>
    <form method="POST" action="?/add" class="space-y-4 border-t border-gray-200 p-4 dark:border-gray-700">
      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Team naam</span>
        <input type="text" name="team" required maxlength="50" placeholder="Team Delta" class="input-field mt-1" />
      </label>
      <button type="submit" class="btn-primary">Toevoegen</button>
    </form>
  </details>

  {#if editId}
    <details class="rounded-xl border border-gray-200 dark:border-gray-700" open>
      <summary class="cursor-pointer rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 list-none [&::-webkit-details-marker]:hidden">
        Team bewerken
      </summary>
      <form method="POST" action="?/update" class="space-y-4 border-t border-gray-200 p-4 dark:border-gray-700">
        <input type="hidden" name="id" value={editId} />
        <label class="block">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Team naam</span>
          <input type="text" name="team" bind:value={editName} required maxlength="50" class="input-field mt-1" />
        </label>
        <div class="flex gap-2">
          <button type="submit" class="btn-primary">Opslaan</button>
          <button type="button" class="btn-secondary" onclick={cancelEdit}>Annuleren</button>
        </div>
      </form>
    </details>
  {/if}
</div>

<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Alle teams ({data?.teams?.length ?? 0})</h2>

<div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
  <table class="w-full">
    <thead>
      <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Team</th>
        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acties</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
      {#each data?.teams ?? [] as team}
        <tr class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
          <td class="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{team.team}</td>
          <td class="px-4 py-3">
            <div class="flex gap-2">
              <button class="btn-secondary btn-xs" onclick={() => startEdit(team)}>Bewerk</button>
              <form method="POST" action="?/delete" id={'delete-' + team.id}>
                <input type="hidden" name="id" value={team.id} />
                <button type="button" class="btn-danger btn-xs" onclick={() => confirmDelete(team)}>Verwijder</button>
              </form>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
