# AutoDJ-Extreme — Dev build

This repository contains the AutoDJ-Extreme project with a Dev management UI and Bun-based public/admin service.

## Quick start (Pelican Panel)

1. Ensure you have Git and Docker installed.

2. Install the egg in Pelican Panel:
   - Go to Admin > Nests > Create Egg
   - Paste the contents of `egg/radio-extreme.json`
   - Set `REPO_BRANCH=dev` to use the dev branch
   - Deploy a container from this egg

3. The container will:
   - Clone the `dev` branch of this repository
   - Copy configs to `/home/container`
   - Start Icecast on the configured port

## Build and test locally (Windows PowerShell)

Ensure Docker Desktop is running, then:

```powershell
# Build image (test only, don't push)
.\scripts\build-and-push.ps1

# Build, test, and push to GHCR (requires "docker login ghcr.io")
.\scripts\build-and-push.ps1 -Push $true
```

Or manually:

```powershell
docker build -t ghcr.io/zeropointbruh/icecast-autodj:dev -f docker/Dockerfile .
docker rm -f autodj-test 2>$null | Out-Null
docker run -d --name autodj-test -p 8000:8000 ghcr.io/zeropointbruh/icecast-autodj:dev
Start-Sleep -Seconds 20
curl http://localhost:8000/status-json.xsl
docker logs autodj-test --tail 200
```

## Dev service (Bun public/admin UI)

Quick start (local, requires Docker and Bun for local development):

1. Generate ports (optional):

```bash
AUTODJ_PORT=8000 ./scripts/generate-ports.sh
```

2. Create `.env` with any Last.fm or admin keys — or edit `.env.example`.

3. Build and run with Docker Compose:

```bash
docker compose up -d --build
```

4. Admin UI: `http://localhost:<PUBLIC_PORT>/` — press "Admin Login" and enter the `ADMIN_KEY` from your `.env` (default `changeme`).

5. Public player: `http://localhost:<PUBLIC_PORT>/player`

Local Bun run (development without Docker):

```bash
# Requires Bun installed
bun run start:public
```

Testing endpoints (quick):

```bash
curl http://localhost:8001/api/status/json
curl http://localhost:8001/api/tracks
```

Notes
- The Pelican egg defaults to cloning the `dev` branch and uses a `dev` image tag; ensure CI publishes `ghcr.io/<owner>/icecast-autodj:dev` or change the egg to use an existing tag.
- Admin authentication uses a static token (`ADMIN_KEY`) provided via env and returned by `/api/admin/login`. Store it in browser `localStorage` via the admin login prompt.

If you want, I can tighten auth, add JWT sessions, or integrate a nicer login form.
