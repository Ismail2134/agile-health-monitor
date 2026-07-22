<script>
  let { url = '', size = 200 } = $props();
  let qrUrl = $derived(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`);
  let hasUrl = $derived(!!url);
</script>

{#if hasUrl}
  <div class="inline-block rounded-lg bg-white p-2 shadow-sm">
    <img src={qrUrl} alt="QR code" width={size} height={size} class="block" />
  </div>
{:else}
  <div class="inline-flex items-center justify-center rounded-lg text-sm text-gray-400 dark:text-gray-600" style="width:{size}px;height:{size}px;background:#e5e7eb;">
    Geen URL
  </div>
{/if}
