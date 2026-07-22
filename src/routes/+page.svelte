<script>
  import { siteTitle, siteDescription } from '$lib/config.js';

  let { data } = $props();
</script>

<svelte:head>
  <title>{siteTitle} - Home</title>
  <meta name="description" content={siteDescription} />
</svelte:head>

<div class="space-y-10">
  <div class="card p-8">
    <h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{siteTitle}</h1>
    <p class="mt-3 text-lg text-gray-600 dark:text-gray-400">{siteDescription}</p>
  </div>

  <section>
    <h2 class="mb-4 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Wat is de Agile Health Check?</h2>
    <p class="mb-6 text-gray-600 dark:text-gray-400">
      De Agile Health Monitor is gebaseerd op het <strong class="text-gray-900 dark:text-white">Spotify Squad Health Check model</strong>.
      Het helpt Scrum Masters en agile coaches om de gezondheid van hun teams te meten
      door middel van een korte vragenlijst die per sprint wordt ingevuld.
    </p>

    <div class="grid gap-6 md:grid-cols-2">
      <div class="card p-6">
        <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Voor Scrum Masters</h3>
        <ol class="list-decimal space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-400">
          <li>Maak een <strong class="text-gray-900 dark:text-white">stemsessie</strong> aan voor jouw team en sprint &mdash; je krijgt een 6-cijferige code.</li>
          <li>Deel de <strong class="text-gray-900 dark:text-white">code</strong>, QR-code of link met je teamleden.</li>
          <li>Teamleden stemmen anoniem &mdash; geen registratie of login nodig.</li>
          <li>Bekijk de <strong class="text-gray-900 dark:text-white">teamresultaten</strong> in het dashboard en ontdek verbeterpunten.</li>
        </ol>
      </div>

      <div class="card p-6">
        <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Voor teamleden</h3>
        <ol class="list-decimal space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-400">
          <li>Open de link of scan de <strong class="text-gray-900 dark:text-white">QR-code</strong> die je van je Scrum Master hebt gekregen.</li>
          <li>Voer de 6-cijferige <strong class="text-gray-900 dark:text-white">code</strong> in en vul je naam (of pseudoniem) in.</li>
          <li>Beantwoord de 15 vragen &mdash;
            <span class="font-semibold text-green-500">groen</span> (goed),
            <span class="font-semibold text-oranje-score">oranje</span> (matig) of
            <span class="font-semibold text-red-score">rood</span> (slecht).
          </li>
          <li>Klaar! Je stem is anoniem opgeslagen.</li>
        </ol>
      </div>
    </div>
  </section>

  <section>
    <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">De {data.questions.length} vragen</h3>
    <div class="space-y-3">
      {#each data.questions as q, i}
        <details class="group rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
          <summary class="cursor-pointer px-5 py-3 text-sm font-medium text-gray-900 transition-colors group-open:bg-gray-50 group-open:dark:bg-gray-800 dark:text-gray-200 list-none [&::-webkit-details-marker]:hidden">
            <span class="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">{i + 1}</span>
            {q.question}
          </summary>
          <div class="grid gap-4 border-t border-gray-100 p-5 dark:border-gray-700 md:grid-cols-2">
            <div class="border-l-4 border-green-500 pl-4">
              <strong class="text-sm text-gray-900 dark:text-white"><span class="dot-sm green"></span> Goed:</strong>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{q.good}</p>
            </div>
            <div class="border-l-4 border-red-500 pl-4">
              <strong class="text-sm text-gray-900 dark:text-white"><span class="dot-sm red"></span> Slecht:</strong>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{q.bad}</p>
            </div>
          </div>
        </details>
      {/each}
    </div>
  </section>
</div>
