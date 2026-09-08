---
name: agile-health-monitor
description: Use when working on the agile-health-monitor project — a SvelteKit + PocketBase app for measuring agile team health (Spotify Squad Health Check model). Dutch-language app. Covers SvelteKit 5 architecture, PocketBase collections, code conventions, auth flow, and project structure.
---

# Agile Health Monitor

## Bezette poorten

Dit project gebruikt **eigen poorten** zodat het naast andere projecten kan draaien
(poort-isolatie per project, volgens `~/.config/opencode/AGENTS.md`).

| Poort | Service | Project |
|---|---|---|
| `localhost:3000` | Productie app (adapter-node / Docker) | agile-health-monitor |
| `localhost:5174` | **Vite dev server** — agile-health-monitor | (zelf) |
| `localhost:8091` | **PocketBase API + Admin UI** — agile-health-monitor | (zelf) |
| `localhost:5173` | Vite dev server — **DevOpsGame** (bezet, niet gebruiken) | |
| `localhost:8090` | PocketBase — **DevOpsGame** (bezet, niet gebruiken) | |

Bij nieuwe projecten: kies andere poorten dan bovenstaande en zet ze in
`.env.development` (`VITE_PORT` + `POCKETBASE_PORT`) zodat `scripts/kill-dev.sh`
de juiste poorten vrijmaakt.

## Lokaal starten

1. Zorg dat `pb_setup/pocketbase` binary aanwezig is (in `.gitignore`,
   handmatig downloaden vanuit `pb_setup/Dockerfile.pocketbase` als 'ie ontbreekt)
2. Controleer dat `pnpm` werkt en `node_modules` up-to-date is
3. `pnpm dev` — `predev` draait `scripts/kill-dev.sh` (poort-scoped op5174/8091),
   daarna start `concurrently` PB + Vite parallel
4. Beschikbaar op:
   - App: <http://localhost:5174/>
   - PB REST API: <http://127.0.0.1:8091/api/>
   - PB admin UI: <http://127.0.0.1:8091/_/>

Stoppen: Ctrl+C (concurrently killed beide processen). Logs: `/tmp/agile-dev-logs/dev.log`.

## Stack / configuratie

- **Poort-isolatie**: `.env.development` (gitignored) bevat
  `VITE_PORT=5174`, `POCKETBASE_PORT=8091`, `VITE_POCKETBASE_PUBLIC_URL`,
  `PB_URL`, `ORIGIN`.
- **Vite**: `vite.config.js` leest `VITE_PORT` → `port` + `strictPort: true`.
- **CSRF**: `svelte.config.js` `trustedOrigins` bevat5174 +3000 + productiedomein.
- **Process-management**: `package.json` `dev` script gebruikt `concurrently`
  met `dev:pb` (`./pb_setup/pocketbase serve --http=127.0.0.1:8091 --dir=pb_setup/pb_data`)
  + `dev:vite` (`vite dev`).
- **Kill-script**: `scripts/kill-dev.sh` leest `.env.development`, doodt alleen
  processen op de eigen poorten. **Geen globale `pkill`** — andere projecten
  blijven onaangeroerd.
- **pnpm 11+**: `pnpm-workspace.yaml` heeft `allowBuilds: { esbuild: true }`
  voor de esbuild postinstall.

## Wat het project doet

Een SvelteKit applicatie gebaseerd op het Spotify Squad Health Check model. Scrum Masters/agile coaches meten team-gezondheid via een stoplicht-enquête (groen/oranje/rood) over 15 dimensies per sprint. Anonieme teamleden stemmen via een 6-cijferige code.

## Tech stack

- **Framework:** SvelteKit (Svelte 5 met runes: `$state()`, `$derived()`, `$effect()`)
- **Backend:** PocketBase v0.23 (ingebakken Auth + SQLite + REST API)
- **CSS:** Tailwind CSS v4 (light/dark theme)
- **Adapter:** `@sveltejs/adapter-node` voor productie
- **Deployment:** Docker + docker-compose (3 services: pocketbase, setup, app)
- **Taal:** JavaScript (ES Modules), géén TypeScript. JSDoc voor annotaties.

## Projectstructuur

```
src/
├── app.css                    # Tailwind CSS + custom styles
├── app.html                   # HTML shell
├── hooks.server.js            # Auth + questions laden (draait elke request)
├── lib/
│   ├── components/
│   │   ├── QRCode.svelte      # QR code via api.qrserver.com
│   │   └── RadarChart.svelte  # SVG radar/spider chart met tooltips en legenda
│   ├── config.js              # Survey questions, nav items, questionLoader
│   ├── pocketbase.js          # Client-side PocketBase singleton
│   └── utils.js               # Kleur/score utility functies
└── routes/
    ├── +layout.svelte         # Root layout (nav, header, footer, theme toggle)
    ├── +layout.server.js      # Laadt user, admin status, questions
    ├── +page.svelte           # Homepage
    ├── login/                 # Login (form action)
    ├── register/              # Registratie met teamselector
    ├── logout/                # Uitloggen
    ├── my-settings/           # Profiel wijzigen + wachtwoord
    ├── team-dashboard/        # Team radar chart + stoplicht-tabel
    ├── vote/
    │   ├── +page.svelte       # Code invoer (6-cijferig)
    │   └── [code]/
    │       └── +page.svelte   # Stemformulier (15 vragen, 3-optie radio)
    └── admin/
        ├── +layout.svelte     # Admin sub-navigatie
        ├── +layout.server.js  # Admin-only guard
        ├── sprints/           # Sprint CRUD
        ├── teams/             # Team CRUD
        ├── votes/             # Stemmen bekijken
        ├── questions/         # Vragen beheren (vast op 15: alleen tekst/volgorde)
        ├── sessions/          # Sessie beheer (QR, code, open/dicht toggle)
        └── sessions/[slug]/   # Sessie detail (radar per stemmer, matrix, comments)
```

## PocketBase data model (8 collections)

| Collection | Belangrijkste velden | Doel |
|---|---|---|
| `users` | `email`, `password`, `team` (text), `admin` (bool) | Gebruikersaccounts |
| `teams` | `team` (text) | Teamnamen |
| `sprints` | `sprint` (text), `team` (text) | Sprints per team |
| `team_health` | `user`, `session`, `voter_name`, `team`, `sprint`, 15 score + 15 comment velden | Individuele stemmen |
| `team_summary` | `team`, `sprint`, 15 score velden (gemiddelden) | Geaggregeerde scores |
| `team_comments` | `sprint`, `team`, 15 comment velden | Geaggregeerde comments |
| `questions` | `field`, `question`, `good`, `bad`, `order` | Vast op 15; `field`-slug onveranderlijk (koppelt schema + config-keys) |
| `sessions` | `code` (6-cijfer), `slug`, `team`, `sprint`, `active` (bool) | Stem-sessie beheer |

## Auth flow

- **Server-side:** `hooks.server.js` laadt PocketBase auth cookie, zet `event.locals.user` en `event.locals.isAdmin`, laadt questions.
- **Client-side:** `$lib/pocketbase.js` exporteert singleton PocketBase client voor client-side auth checks.
- **Admin guard:** `admin/+layout.server.js` checkt `locals.isAdmin` en redirect anders naar `/login`.
- **Authenticated guard:** Pagina's zoals `my-settings` checken `locals.user`.

## State management patronen

- Geen externe state library. Gebruikt Svelte 5 runes: `$state()`, `$derived()`, `$effect()`.
- Server state wordt geladen via SvelteKit `load()` functies in `+page.server.js` / `+layout.server.js`.
- Mutaties verlopen via SvelteKit form actions.
- Geen client-side routing library — alles via SvelteKit's ingebouwde form actions + redirects.

## Code conventies

- **Taal:** JavaScript, géén TypeScript. Gebruik JSDoc voor type-annotaties.
- **Module systeem:** ESM (`import`/`export`, `"type": "module"`).
- **UI tekst:** Alle user-facing tekst en comments zijn in het Nederlands.
- **Componenten:** Svelte 5 syntax — gebruik `$state()`, `$derived()`, `$effect()` runes, niet de oude Svelte 4 stores.
- **Styling:** Tailwind CSS v4 met custom CSS in `app.css`. Gebruik Tailwind utility classes en `@layer` voor component-stijlen.
- **PocketBase queries:** Gebruik de PocketBase JavaScript SDK (`pb.collection('name').getFullList()` etc).

## De 15 survey vragen (standaard)

1. Waarde leveren — Levert het team continue waarde aan de klant?
2. Kwaliteit van de codebase — Is de code van hoge kwaliteit?
3. Taakplanning en prioritering — Duidelijke planning en prioritering?
4. Informatie delen — Wordt informatie goed gedeeld?
5. Samenwerking — Hoe goed werkt het team samen?
6. Events — Zijn de Scrum/agile ceremonies effectief?
7. Leren en plezier — Is er ruimte voor leren en plezier?
8. Regie over eigen werk — Heeft het team autonomie?
9. Product Ownership — Is de Product Owner effectief?
10. Snelheid en incrementele oplevering — Levert het team snel en incrementeel?
11. Makkelijk te releasen — Is releasen eenvoudig?
12. Passende processen — Zijn de processen passend?
13. Tooling — Is de tooling op orde?
14. Ondersteuning — Krijgt het team voldoende ondersteuning?
15. Manager geeft het goede voorbeeld — Geeft de manager het goede voorbeeld?

## Key patterns

- **QRCode.svelte:** Genereert QR URL via `https://api.qrserver.com/v1/create-qr-code/?size={size}x{size}&data={url}`.
- **RadarChart.svelte:** SVG gebaseerde radar chart met 3 concentrische polygonen (groen/oranje/rood zones), as-labels, multi-dataset overlays, hover tooltips, en checkbox legenda.
- **Session voting flow:** Admin maakt session → genereert 6-cijferige code → deelt code/QR → team members gaan naar `/vote`, voeren code in → vullen 15 vragen in (optioneel anoniem) → stem wordt opgeslagen in `team_health`, summaries worden herberekend.
