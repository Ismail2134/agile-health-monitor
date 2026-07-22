<script>
  /** @type {{ data: any, form: any }} */
  let { data, form } = $props();

  let editId = $state('');
  let editField = $state('');
  let editQuestion = $state('');
  let editGood = $state('');
  let editBad = $state('');
  let editOrder = $state(0);
  let message = $state('');
  let errorMsg = $state('');

  $effect(() => {
    if (form?.success) { message = form.success; errorMsg = ''; }
    if (form?.error) { errorMsg = form.error; message = ''; }
  });

  function startEdit(q) {
    editId = q.id;
    editField = q.field;
    editQuestion = q.question;
    editGood = q.good;
    editBad = q.bad;
    editOrder = q.order;
  }

  function cancelEdit() {
    editId = '';
    editField = '';
    editQuestion = '';
    editGood = '';
    editBad = '';
    editOrder = 0;
  }
</script>

<svelte:head>
  <title>Vragen beheren - Admin</title>
</svelte:head>

<h1 class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">Vragen beheren</h1>
<p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Pas de Health Check vragen aan. Wijzigingen zijn direct zichtbaar in de stemmodule en dashboards.</p>

{#if message}
  <div class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">{message}</div>
{/if}
{#if errorMsg}
  <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">{errorMsg}</div>
{/if}

<div class="mb-5 space-y-3">
  <details class="rounded-xl border border-gray-200 dark:border-gray-700">
    <summary class="cursor-pointer rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 list-none [&::-webkit-details-marker]:hidden">
      + Nieuwe vraag toevoegen
    </summary>
    <form method="POST" action="?/add" class="space-y-4 border-t border-gray-200 p-4 dark:border-gray-700">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Veldnaam (slug)</span>
          <input type="text" name="field" required placeholder="mijn_nieuwe_vraag" pattern="[a-z0-9_]+" class="input-field mt-1" />
        </label>
        <label class="block">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Volgorde</span>
          <input type="number" name="order" value={data?.nextOrder ?? 1} min="1" required class="input-field mt-1" />
        </label>
      </div>
      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Vraag</span>
        <input type="text" name="question" required placeholder="Korte titel van de vraag" class="input-field mt-1" />
      </label>
      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Goed beschrijving</span>
        <textarea name="good" required rows="2" placeholder="Beschrijving van wat goed gaat..." class="input-field mt-1"></textarea>
      </label>
      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Slecht beschrijving</span>
        <textarea name="bad" required rows="2" placeholder="Beschrijving van wat slecht gaat..." class="input-field mt-1"></textarea>
      </label>
      <button type="submit" class="btn-primary">Toevoegen</button>
    </form>
  </details>

  {#if editId}
    <details class="rounded-xl border border-gray-200 dark:border-gray-700" open>
      <summary class="cursor-pointer rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 list-none [&::-webkit-details-marker]:hidden">
        Vraag bewerken
      </summary>
      <form method="POST" action="?/update" class="space-y-4 border-t border-gray-200 p-4 dark:border-gray-700">
        <input type="hidden" name="id" value={editId} />
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Veldnaam</span>
            <input type="text" name="field" bind:value={editField} required pattern="[a-z0-9_]+" class="input-field mt-1" />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Volgorde</span>
            <input type="number" name="order" bind:value={editOrder} min="1" required class="input-field mt-1" />
          </label>
        </div>
        <label class="block">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Vraag</span>
          <input type="text" name="question" bind:value={editQuestion} required class="input-field mt-1" />
        </label>
        <label class="block">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Goed beschrijving</span>
          <textarea name="good" bind:value={editGood} required rows="2" class="input-field mt-1"></textarea>
        </label>
        <label class="block">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Slecht beschrijving</span>
          <textarea name="bad" bind:value={editBad} required rows="2" class="input-field mt-1"></textarea>
        </label>
        <div class="flex gap-2">
          <button type="submit" class="btn-primary">Opslaan</button>
          <button type="button" class="btn-secondary" onclick={cancelEdit}>Annuleren</button>
        </div>
      </form>
    </details>
  {/if}
</div>

<h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Alle vragen ({data?.questions?.length ?? 0})</h2>

<div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
  <table class="w-full">
    <thead>
      <tr class="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</th>
        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Vraag</th>
        <th class="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Goed</th>
        <th class="hidden md:table-cell px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Slecht</th>
        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acties</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
      {#each data?.questions ?? [] as q}
        <tr class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
          <td class="px-4 py-3 text-sm text-gray-500">{q.order}</td>
          <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{q.question}</td>
          <td class="hidden md:table-cell px-4 py-3 max-w-[200px] truncate text-sm text-green-600 dark:text-green-400">{q.good}</td>
          <td class="hidden md:table-cell px-4 py-3 max-w-[200px] truncate text-sm text-red-500 dark:text-red-400">{q.bad}</td>
          <td class="px-4 py-3">
            <div class="flex gap-2">
              <button class="btn-secondary btn-xs" onclick={() => startEdit(q)}>Bewerk</button>
              <form method="POST" action="?/delete" id={'del-' + q.id}>
                <input type="hidden" name="id" value={q.id} />
                <button type="button" class="btn-danger btn-xs" onclick={() => { if (window.confirm('Vraag verwijderen?')) document.getElementById('del-' + q.id).requestSubmit(); }}>Verwijder</button>
              </form>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
