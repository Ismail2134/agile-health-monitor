<script>
  /** @type {{ form: any }} */
  let { data } = $props();
</script>

<svelte:head>
  <title>Inloggen - Agile Health Monitor</title>
</svelte:head>

<div class="mx-auto max-w-md">
  <div class="card p-8">
    <h1 class="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">Inloggen</h1>

    {#if data?.error}
      <div class="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
        {data.error}
      </div>
    {/if}

    <form method="POST" class="space-y-4">
      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Gebruikersnaam</span>
        <input type="text" name="username" required placeholder="Jouw gebruikersnaam" class="input-field mt-1" />
      </label>
      <label class="block">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Wachtwoord</span>
        <input type="password" name="password" required placeholder="Jouw wachtwoord" class="input-field mt-1" />
      </label>
      <button type="submit" class="btn-primary w-full py-2.5">Inloggen</button>
    </form>

    <p class="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
      Nog geen account? <a href="/register" class="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">Registreren</a>
    </p>
  </div>
</div>
