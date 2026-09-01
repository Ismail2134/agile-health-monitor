<script>
  let code = $state('');
  let error = $state('');
  function submit(e) {
    const c = code.replace(/\D/g, '');
    if (c.length !== 6) {
      e.preventDefault();
      error = 'Voer een 6-cijferige code in.';
      return;
    }
    window.location.href = '/vote/' + c;
    e.preventDefault();
  }
</script>

<svelte:head><title>Votes - Code invoeren</title></svelte:head>

<div class="card p-8 text-center">
  <h1 class="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Team Health Check</h1>
  <p class="mb-6 text-sm text-gray-600 dark:text-gray-400">Voer de 6-cijferige code in die je van je Scrum Master hebt gekregen:</p>

  {#if error}
    <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
      {error}
    </div>
  {/if}

  <form onsubmit={submit}>
    <input
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="6"
      placeholder="000000"
      bind:value={code}
      class="mx-auto mb-5 block w-full max-w-72 rounded-xl border-2 border-gray-200 bg-gray-50 py-3 text-center text-3xl sm:text-4xl tracking-[0.4em] font-semibold text-gray-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400"
      style="font-variant-numeric: tabular-nums;"
    />
    <button type="submit" class="btn-primary w-48 py-2.5">Start stemmen</button>
  </form>
</div>
