<script>
  import '../app.css';
  import { getPb } from '$lib/pocketbase.js';
  import { navItems, siteTitle } from '$lib/config.js';

  let { data, children } = $props();
  let user = $derived(data?.user ?? null);
  let isAdmin = $derived(data?.isAdmin ?? false);
  let isDark = $state(false);

  $effect(() => {
    isDark = document.documentElement.classList.contains('dark');
  });

  function toggleTheme() {
    const html = document.documentElement;
    const next = !html.classList.contains('dark');
    html.classList.toggle('dark', next);
    isDark = next;
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  async function handleLogout(e) {
    e.preventDefault();
    const pb = getPb();
    pb.authStore.clear();
    document.cookie = 'pb_auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/';
  }
</script>

<header class="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
  <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
    <a href="/" class="text-lg font-bold text-brand-700 transition-colors hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300">
      {siteTitle}
    </a>
    <nav class="flex items-center gap-0.5">
      {#each navItems as item}
        {#if item.auth === undefined || (item.auth === true && user) || (item.auth === false && !user)}
          {#if !item.admin || (item.admin && isAdmin)}
            <a href={item.href} class="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100">
              {item.label}
            </a>
          {/if}
        {/if}
      {/each}
      <button
        type="button"
        onclick={toggleTheme}
        class="ml-1 rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        aria-label={isDark ? 'Schakel naar licht thema' : 'Schakel naar donker thema'}
        title={isDark ? 'Licht thema' : 'Donker thema'}
      >
        {#if isDark}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" /></svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
        {/if}
      </button>
      {#if user}
        <a href="/logout" onclick={handleLogout} class="ml-1 rounded-md px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
          Uitloggen
        </a>
      {/if}
    </nav>
  </div>
</header>

<main class="mx-auto min-h-[70vh] max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
  {#if user}
    <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
      Ingelogd als <strong class="font-semibold text-gray-700 dark:text-gray-300">{user.username || user.email}</strong>
      {#if user.team}
        <span class="mx-1.5 text-gray-300 dark:text-gray-600">|</span>
        Teams: <strong class="font-semibold text-gray-700 dark:text-gray-300">{user.team}</strong>
      {/if}
    </p>
  {/if}
  {@render children?.()}
</main>

<footer class="border-t border-gray-200 bg-white py-6 dark:border-gray-800 dark:bg-gray-950">
  <div class="mx-auto max-w-6xl px-4 text-center text-sm text-gray-400 dark:text-gray-500 sm:px-6 lg:px-8">
    {siteTitle} &copy; {new Date().getFullYear()}
  </div>
</footer>
