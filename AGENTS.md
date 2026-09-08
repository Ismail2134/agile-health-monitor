# AGENTS.md — agile-health-monitor

De canonieke project-doc is `.opencode/skills/agile-health-monitor/SKILL.md`
(wordt automatisch geladen via `opencode.json`). Lees die eerst voor
architectuur, structuur, poorten en conventies. Dit bestand vult alleen de
operationele gaten aan die een agent anders zou missen.

## Package-manager: pnpm lokaal, npm in Docker/CI

- Lokaal: `pnpm` (`pnpm dev`, `pnpm build`). Docker-build en GitHub Actions
  gebruiken `npm ci` + `package-lock.json` (zie `Dockerfile`, `.github/workflows/deploy.yml`).
- Beide lockfiles zijn gecommit (`package-lock.json` + `pnpm-lock.yaml`).
  Bij dependency-wijzigingen beide updaten, anders kloppen Docker-build/CI niet.

## Verificatie

- Geen test-suite aanwezig.
- `pnpm lint` faalt: het script roept `prettier`/`eslint` aan, maar die staan
  niet in devDependencies en er is geen config. Gebruik `pnpm build` (vite
  build) als sanity-check.

## Survey-vragen: TWEË bronnen (belangrijkste gotcha)

- **Hardcoded fallback**: `surveyQuestions` in `src/lib/config.js`. Zodra de
  PocketBase `questions`-collectie leeg is of onbereikbaar, gebruikt
  `loadQuestions()` (in datzelfde bestand, aangeroepen vanuit `hooks.server.js`)
  deze lijst. De app toont dus altijd 15 vragen, óók met een lege DB-collectie.
- **`questions`-collectie** (bewerkbaar via admin `/admin/questions`) wordt
  ALLEEN gevuld door `setup-pb.mjs` (seed) of handmatig in de admin-UI.
- `pb_migrations/*.js` maken alleen het **schema**, geen records.
- `pnpm dev` én `scripts/deploy-vps.sh` draaien de seed **niet** automatisch.
  Symptoom van een niet-gedraaide seed: de site werkt prima (fallback), maar de
  `questions`-collectie en de admin-vragenpagina zijn leeg.

### Seed uitvoeren

- Productie (idempotent): `pnpm prod:seed`
  (= `docker compose -f compose.production.yml --profile seed run --rm setup`).
- Lokaal tegen draaiende dev-PB: `node setup-pb.mjs`
  (defaults `PB_URL=http://127.0.0.1:8090`, creds uit `.env`/`.env.development`).

Let op: `setup-pb.mjs` is idempotent per record (vragen op `field`, teams/sprints
op uniek veld), maar seed **altijd** de default-teams (Team Alpha/Beta/Gamma) en
10 geneste sprints erbij als ze ontbreken — ook op een bestaande DB. En hij
maakt een app-admin gebruiker (`admin`, `admin:true`) aan als die ontbreekt.

## PocketBase-productie (VPS)

- Containers `agile-health-monitor-app` (SvelteKit Node :3000) en
  `agile-health-monitor-pocketbase` (:8090). PB-admin/API achter Traefik op
  `https://<DOMAIN>/_/` en `/api/` (PathPrefix-router in `compose.production.yml`).
- Data (SQLite) zit nooit in git/image; named volume `agile-health-monitor_pb_data`.
  `scripts/deploy-vps.sh` exclut `pb_data` en `pb_setup/pb_data` bij rsync.
- Volume-init (alleen bij LEEG volume) kopieert de lokale `pb_setup/pb_data`
  (vereist `sqlite3`-CLI lokaal); bij een bestaand volume blijft VPS-data bewaard.
- Schema-wijzigingen via nieuwe files in `pb_migrations/` (auto toegepast bij
  PB-start, in prod read-only gemount). Bewerkingen via de API/`setup-pb.mjs`
  zijn niet aan migrations gekoppeld.
- VPS-state checken (read-only): superuser-token ophalen via
  `POST /api/collections/_superusers/auth-with-password` (creds in
  `/docker/agile-health-monitor/.env` op de VPS), dan records tellen.
  Quoting door ssh + `docker compose exec` is fragiel — pipe een script via
  `scp` + `ssh 'bash /tmp/x.sh < /dev/null'` in plaats van inline-quoting.

## Overig

- Dev-poorten (5174/8091), `kill-dev.sh` en lokale start: zie SKILL.md.
- Er zijn twee PB-datadirs; de actieve dev-DB is `pb_setup/pb_data`
  (gitignored, ook de init-bron voor een leeg VPS-volume). De oudere `pb_data/`
  (root) wordt niet door scripts gebruikt.
