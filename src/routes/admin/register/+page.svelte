<script>
  /** @type {{ form: any }} */
  let { data, form } = $props();

  let message = $state('');
  let errorMsg = $state('');
  let selectedTeams = $state(new Set());

  $effect(() => {
    if (form?.success) { message = form.success; errorMsg = ''; }
    if (form?.error) { errorMsg = form.error; message = ''; }
  });

  function toggleTeam(name) {
    const next = new Set(selectedTeams);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    selectedTeams = next;
  }

  let teamValue = $derived([...selectedTeams].join(', '));
</script>

<svelte:head>
  <title>Nieuwe gebruiker - Admin</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Nieuwe gebruiker aanmaken</h1>

{#if message}
  <div class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">{message}</div>
{/if}
{#if errorMsg}
  <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">{errorMsg}</div>
{/if}

<div class="mx-auto max-w-md">
  <form method="POST" class="space-y-4">
    <label class="block">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Gebruikersnaam</span>
      <input type="text" name="username" required minlength="2" placeholder="Jouw gebruikersnaam" class="input-field mt-1" />
    </label>
    <fieldset>
      <legend class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teams</legend>
      <div class="space-y-1.5">
        {#each data?.teams ?? [] as team}
          <label class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" name="teams" value={team.team} checked={selectedTeams.has(team.team)} onchange={() => toggleTeam(team.team)} class="rounded border-gray-300" />
            {team.team}
          </label>
        {/each}
      </div>
      {#if selectedTeams.size === 0}
        <p class="mt-1 text-xs text-gray-400">Selecteer minimaal 1 team</p>
      {/if}
    </fieldset>
    <input type="hidden" name="team" value={teamValue} />
    <label class="block">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Wachtwoord</span>
      <input type="password" name="password" required minlength="8" placeholder="Minimaal 8 tekens" class="input-field mt-1" />
    </label>
    <label class="block">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Wachtwoord bevestigen</span>
      <input type="password" name="passwordConfirm" required minlength="8" placeholder="Herhaal wachtwoord" class="input-field mt-1" />
    </label>
    <button type="submit" class="btn-primary w-full py-2.5" disabled={selectedTeams.size === 0}>Gebruiker aanmaken</button>
  </form>
</div>
