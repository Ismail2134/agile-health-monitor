<script>
  import { getTrafficLightColor, getTrafficLightLabel } from '$lib/utils.js';

  let { value = null, label = '', size = 240 } = $props();

  let isDark = $state(false);

  $effect(() => {
    const html = document.documentElement;
    isDark = html.classList.contains('dark');
    const observer = new MutationObserver(() => {
      isDark = html.classList.contains('dark');
    });
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  });

  const W = 220;
  const H = 150;
  const cx = 110;
  const cy = 130;
  const R = 90;
  const SEGMENTS = 120;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function colorAt(v) {
    const stops = [
      { v: 1, c: [0x22, 0xc5, 0x5e] },
      { v: 2, c: [0xf5, 0x9e, 0x0b] },
      { v: 3, c: [0xef, 0x44, 0x44] }
    ];
    let i = 0;
    while (i < stops.length - 1 && v > stops[i + 1].v) i++;
    const s0 = stops[i];
    const s1 = stops[i + 1];
    const t = Math.min(1, Math.max(0, (v - s0.v) / (s1.v - s0.v)));
    const r = Math.round(lerp(s0.c[0], s1.c[0], t));
    const g = Math.round(lerp(s0.c[1], s1.c[1], t));
    const b = Math.round(lerp(s0.c[2], s1.c[2], t));
    return `rgb(${r},${g},${b})`;
  }

  function pointAt(v, radius) {
    const a = ((3 - v) / 2) * Math.PI;
    return { x: cx + radius * Math.cos(a), y: cy - radius * Math.sin(a) };
  }

  const segments = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const v1 = 1 + (2 * i) / SEGMENTS;
    const v2 = 1 + (2 * (i + 1)) / SEGMENTS;
    const p1 = pointAt(v1, R);
    const p2 = pointAt(v2, R);
    segments.push({ p1, p2, color: colorAt((v1 + v2) / 2) });
  }

  const thresholds = [1.5, 2.5];
  const tick = thresholds.map(v => {
    const inner = pointAt(v, R + 4);
    const outer = pointAt(v, R + 13);
    return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
  });

  const needleEnd = value != null ? pointAt(value, R - 14) : null;
  const needleColor = value != null ? getTrafficLightColor(value) : null;
  const labelText = value != null ? getTrafficLightLabel(value) : null;

  const svgH = Math.round((H / W) * size);
  const trackColor = isDark ? '#374151' : '#e5e7eb';
  const scaleColor = isDark ? '#9ca3af' : '#6b7280';
</script>

<div class="flex flex-col items-center">
  {#if label}
    <div class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
  {/if}

  <svg width={size} height={svgH} viewBox="0 0 {W} {H}">
    {#each segments as seg}
      <line x1={seg.p1.x} y1={seg.p1.y} x2={seg.p2.x} y2={seg.p2.y} stroke={value != null ? seg.color : trackColor} stroke-width="12" stroke-linecap="round" />
    {/each}

    {#each tick as t}
      <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={isDark ? '#6b7280' : '#d1d5db'} stroke-width="1.5" stroke-linecap="round" />
    {/each}

    {#if needleEnd}
      <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke={needleColor} stroke-width="3" stroke-linecap="round" />
      <circle cx={cx} cy={cy} r="5" fill={isDark ? '#1f2937' : '#ffffff'} stroke={needleColor} stroke-width="2" />
    {/if}

    <text x={pointAt(1, R).x} y={cy + 18} text-anchor="middle" font-size="11" font-weight="600" fill={scaleColor}>1</text>
    <text x={pointAt(3, R).x} y={cy + 18} text-anchor="middle" font-size="11" font-weight="600" fill={scaleColor}>3</text>
  </svg>

  {#if value != null}
    <div class="mt-1 flex items-center gap-2 text-sm">
      <span class="dot-sm" style="background:{needleColor}"></span>
      <strong class="text-gray-900 dark:text-white">{value.toFixed(2)}</strong>
      <span class="font-medium" style="color:{needleColor}">{labelText}</span>
    </div>
  {:else}
    <div class="mt-1 text-sm text-gray-400 dark:text-gray-500">Geen data</div>
  {/if}
</div>
