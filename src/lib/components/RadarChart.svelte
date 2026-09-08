<script>
  const sprintColors = [
    '#1a73e8', '#e8710a', '#9334e6', '#00acc1',
    '#d81b60', '#0d904f', '#e64a19', '#546e7a',
    '#6d4c41', '#00897b', '#9e9d24', '#3949ab'
  ];

  function scoreBg(s) {
    if (s == null) return '#e5e7eb';
    if (s <= 1.5) return '#22c55e';
    if (s <= 2.5) return '#f59e0b';
    return '#ef4444';
  }

  let { questions = [], datasets = [], size = 600, chartMaxWidth = 540, legendTop } = $props();
  let hovered = $state(null);
  let visible = $state(new Set());
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

  $effect(() => {
    visible = new Set(datasets.map((_, i) => i));
  });

  function toggle(i) {
    const next = new Set(visible);
    if (next.has(i)) {
      if (next.size === 1) return;
      next.delete(i);
    } else {
      next.add(i);
    }
    visible = next;
  }

  function toggleAll() {
    visible = new Set(datasets.map((_, i) => i));
  }

  function clearAll() {
    visible = new Set([0]);
  }

  let cx = $derived(size / 2);
  let cy = $derived(size / 2);
  let maxR = $derived(size * 0.34);
  let labelR = $derived(size * 0.40);
  let n = $derived(questions.length);
  let angleStep = $derived((2 * Math.PI) / n);

  function polar(angle, r) {
    return { x: cx + r * Math.cos(angle - Math.PI / 2), y: cy + r * Math.sin(angle - Math.PI / 2) };
  }

  let chartDatasets = $derived(datasets.slice(0, 12));

  let visibleDatasets = $derived(
    chartDatasets.filter((_, i) => visible.has(i))
  );

  let visiblePointsForDataset = $derived(
    chartDatasets.map((ds, di) => {
      if (!visible.has(di)) return null;
      const pts = questions.map((q, i) => {
        const score = ds.scores?.[q.field] ?? ds[q.field];
        if (score == null) return null;
        const angle = i * angleStep;
        const r = (score / 3) * maxR;
        const p = polar(angle, r);
        return { x: p.x, y: p.y, score, label: q.question, angle, r, field: q.field };
      });
      return { label: ds.label, color: sprintColors[di % sprintColors.length], points: pts, index: di };
    })
  );

  let axisLabels = $derived(
    questions.map((q, i) => {
      const angle = i * angleStep;
      const outer = polar(angle, maxR);
      const labelPos = polar(angle, labelR);
      return { outer, labelPos, label: q.question, angle, index: i };
    })
  );

  let zones = $derived([
    { r: maxR,              fill: 'rgba(198,40,40,0.14)', stroke: '#ef5350', label: 'Slecht', labelR: maxR * 0.92 },
    { r: maxR * (2.5 / 3),  fill: 'rgba(230,120,20,0.15)', stroke: '#ffb74d', label: 'Matig', labelR: maxR * 0.72 },
    { r: maxR * (1.5 / 3),  fill: 'rgba(46,125,50,0.18)',  stroke: '#66bb6a', label: 'Goed', labelR: maxR * 0.42 }
  ]);
</script>

<div class="flex flex-col sm:flex-row items-center justify-center gap-6">
  <div class="min-w-0 flex-1" style={chartMaxWidth != null ? `max-width:${chartMaxWidth}px` : undefined}>
    <div class="overflow-x-auto">
      <svg viewBox="0 0 {size} {size}" class="w-full h-auto max-w-full">
        {#each zones as zone}
          {@const pts = axisLabels.map(a => polar(a.angle, zone.r))}
          <polygon
            points={pts.map(p => `${p.x},${p.y}`).join(' ')}
            fill={zone.fill}
            stroke={zone.stroke}
            stroke-width="1.5"
            stroke-dasharray="4,3"
          />
          <text
            x={polar(0, zone.labelR).x}
            y={polar(0, zone.labelR).y + 5}
            text-anchor="middle"
            font-size="10"
            font-weight="700"
            fill={isDark ? '#e5e7eb' : '#555'}
          >{zone.label}</text>
        {/each}

        {#each axisLabels as axis}
          <line
            x1={cx} y1={cy}
            x2={axis.outer.x} y2={axis.outer.y}
            stroke="#d1d5db"
            stroke-width="0.5"
          />
          <text
            x={axis.labelPos.x}
            y={axis.labelPos.y}
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="10"
            font-weight="500"
            fill={isDark ? '#e5e7eb' : '#374151'}
          >{axis.label.substring(0, 25)}</text>
        {/each}

        <circle cx={cx} cy={cy} r="2" fill={isDark ? '#6b7280' : '#9ca3af'} />

        {#each visiblePointsForDataset as dsInfo}
          {#if dsInfo !== null}
            {@const validPts = dsInfo.points.filter(p => p !== null)}
            {#if validPts.length >= 3}
              <polygon
                points={validPts.map(p => `${p.x},${p.y}`).join(' ')}
                fill={dsInfo.color}
                fill-opacity="0.06"
                stroke={dsInfo.color}
                stroke-width="1.8"
                stroke-opacity="0.9"
              />
              {#each validPts as pt}
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <circle
                  cx={pt.x} cy={pt.y} r="6"
                  fill={scoreBg(pt.score)}
                  stroke="#fff"
                  stroke-width="1.5"
                  role="tooltip"
                  aria-label="{pt.label}: {pt.score}"
                  style="cursor:pointer;"
                  onmouseenter={() => hovered = { ...pt, sprint: dsInfo.label }}
                  onmouseleave={() => hovered = null}
                />
              {/each}
            {/if}
          {/if}
        {/each}
      </svg>
    </div>

    {#if hovered}
      <div class="py-2 text-center">
        <small class="text-xs text-gray-600 dark:text-gray-400">
          <strong>{hovered.sprint}</strong> &mdash;
          {hovered.label}:&nbsp;
          <span class="dot-sm" style="background:{scoreBg(hovered.score)}"></span>
          <strong>{hovered.score}</strong>
        </small>
      </div>
    {/if}
  </div>

  <div class="min-w-[120px] sm:min-w-[180px]">
    {#if legendTop}
      <div class="mb-3">
        {@render legendTop()}
      </div>
    {/if}
    <div class="mb-2 flex flex-wrap gap-1.5">
      <button type="button" class="btn-secondary btn-xs sm:btn-sm text-[11px] sm:text-xs" onclick={toggleAll}>Alles aan</button>
      <button type="button" class="btn-secondary btn-xs sm:btn-sm text-[11px] sm:text-xs" onclick={clearAll}>Alles uit</button>
    </div>
    <div class="flex flex-col gap-1">
      {#each chartDatasets as ds, di}
        {@const checked = visible.has(di)}
        {@const color = sprintColors[di % sprintColors.length]}
        <label class="flex cursor-pointer items-center gap-1.5 py-1.5 text-xs transition-opacity" class:opacity-45={!checked}>
          <input type="checkbox" checked={checked} onchange={() => toggle(di)} class="h-3.5 w-3.5 rounded border-gray-300" />
          <span class="inline-block h-[3px] w-3.5 rounded-sm" style="background:{color};"></span>
          {ds.label}
        </label>
      {/each}
    </div>
  </div>
</div>
