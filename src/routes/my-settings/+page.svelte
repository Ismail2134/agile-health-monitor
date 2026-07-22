<script>
  /** @type {{ data: any, form: any }} */
  let { data, form } = $props();

  let profileMessage = $state('');
  let profileError = $state('');
  let passwordMessage = $state('');
  let passwordError = $state('');

  let selectedTeams = $state(new Set());
  let userTeams = $derived((data?.user?.team || '').split(', ').filter(Boolean));

  $effect(() => {
    selectedTeams = new Set(userTeams);
  });

  $effect(() => {
    if (form?.profileSuccess) {
      profileMessage = form.profileSuccess;
      profileError = '';
    }
    if (form?.profileError) {
      profileError = form.profileError;
      profileMessage = '';
    }
    if (form?.passwordSuccess) {
      passwordMessage = form.passwordSuccess;
      passwordError = '';
    }
    if (form?.passwordError) {
      passwordError = form.passwordError;
      passwordMessage = '';
    }
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
  <title>Mijn Instellingen - Agile Health Monitor</title>
</svelte:head>

<div class="card p-8">
  <h1 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Mijn Instellingen</h1>

  <section class="mb-8">
    <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Profiel bewerken</h2>

    {#if profileMessage}
      <div class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
        {profileMessage}
      </div>
    {/if}
    {#if profileError}
      <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
        {profileError}
      </div>
    {/if}

    <form method="POST" action="?/updateProfile" class="space-y-4">
      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Gebruikersnaam</span>
        <input type="text" name="username" value={data?.user?.username ?? ''} required class="input-field mt-1" />
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
      </fieldset>
      <input type="hidden" name="team" value={teamValue} />
      <button type="submit" class="btn-primary">Profiel opslaan</button>
    </form>
  </section>

  <hr class="border-gray-200 dark:border-gray-700" />

  <section class="mt-8">
    <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Wachtwoord wijzigen</h2>

    {#if passwordMessage}
      <div class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
        {passwordMessage}
      </div>
    {/if}
    {#if passwordError}
      <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
        {passwordError}
      </div>
    {/if}

    <form method="POST" action="?/changePassword" class="space-y-4">
      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Huidig wachtwoord</span>
        <input type="password" name="oldPassword" required minlength="8" class="input-field mt-1" />
      </label>
      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Nieuw wachtwoord</span>
        <input type="password" name="newPassword" required minlength="8" class="input-field mt-1" />
      </label>
      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Bevestig nieuw wachtwoord</span>
        <input type="password" name="newPasswordConfirm" required minlength="8" class="input-field mt-1" />
      </label>
      <button type="submit" class="btn-primary">Wachtwoord wijzigen</button>
    </form>
  </section>
</div>
