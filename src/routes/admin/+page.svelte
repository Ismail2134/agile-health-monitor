<script>
  import { PB_PUBLIC_URL } from '$lib/pocketbase.js';

  /** @type {{ data: any }} */
  let { data } = $props();

  let currentTime = $state(new Date().toLocaleString('nl-NL'));
  const pbAdminUrl = `${PB_PUBLIC_URL}/_/`;
</script>

<svelte:head>
  <title>Admin Dashboard - Agile Health Monitor</title>
</svelte:head>

<h1 class="mb-1 text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
<p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Laatst bijgewerkt: {currentTime}</p>

<div class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
  <a href="/admin/teams" class="block rounded-xl border border-brand-100 bg-brand-50 p-5 text-center no-underline transition-shadow hover:shadow-md hover:-translate-y-0.5 dark:border-brand-900 dark:bg-brand-950">
    <span class="text-3xl font-bold text-brand-700 dark:text-brand-400">{data?.teamCount ?? '-'}</span>
    <p class="mt-1 text-xs font-medium text-brand-600 dark:text-brand-400">Teams</p>
  </a>
  <a href="/admin/sprints" class="block rounded-xl border border-amber-100 bg-amber-50 p-5 text-center no-underline transition-shadow hover:shadow-md hover:-translate-y-0.5 dark:border-amber-900 dark:bg-amber-950">
    <span class="text-3xl font-bold text-amber-700 dark:text-amber-400">{data?.sprintCount ?? '-'}</span>
    <p class="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">Sprints</p>
  </a>
  <a href={pbAdminUrl} target="_blank" class="block rounded-xl border border-blue-100 bg-blue-50 p-5 text-center no-underline transition-shadow hover:shadow-md hover:-translate-y-0.5 dark:border-blue-900 dark:bg-blue-950">
    <span class="text-3xl font-bold text-blue-700 dark:text-blue-400">{data?.userCount ?? '-'}</span>
    <p class="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">Gebruikers</p>
  </a>
  <a href="/admin/votes" class="block rounded-xl border border-purple-100 bg-purple-50 p-5 text-center no-underline transition-shadow hover:shadow-md hover:-translate-y-0.5 dark:border-purple-900 dark:bg-purple-950">
    <span class="text-3xl font-bold text-purple-700 dark:text-purple-400">{data?.voteCount ?? '-'}</span>
    <p class="mt-1 text-xs font-medium text-purple-600 dark:text-purple-400">Votes</p>
  </a>
</div>

<section>
  <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Snelle links</h2>
  <div class="grid gap-3 sm:grid-cols-2">
    <a href="/admin/sprints" class="btn-secondary no-underline inline-flex items-center justify-center gap-2 py-2.5">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 100-2H7z" clip-rule="evenodd" /></svg>
      Sprints beheren
    </a>
    <a href="/admin/teams" class="btn-secondary no-underline inline-flex items-center justify-center gap-2 py-2.5">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zm5 2a2 2 0 11-4 0 2 2 0 014 0zm-7 4a2 2 0 00-2 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 00-2-2H9z" /></svg>
      Teams beheren
    </a>
    <a href="/admin/votes" class="btn-secondary no-underline inline-flex items-center justify-center gap-2 py-2.5">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" /></svg>
      Votes bekijken
    </a>
    <a href={pbAdminUrl} target="_blank" class="btn-secondary no-underline inline-flex items-center justify-center gap-2 py-2.5 border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-400 dark:hover:bg-brand-900">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
      PocketBase Admin UI
    </a>
  </div>
</section>
