# hl-apps

Henry's app-a-day challenge — vibe-coding and deploying apps daily to Cloud Run.

Each app is a self-contained service, deployed independently, and served at
`https://hl-apps.web.app/apps/<app-name>` via Firebase Hosting.

## Apps

| App | Stack | Description |
|-----|-------|-------------|
| [test-app](apps/test-app) | Python / Flask | Simple Cloud Run service with HTML interface — the original scaffold |
| [db-test](apps/db-test) | TypeScript / Express / Firestore | CRUD items demo and the Firestore reference implementation |
| [commute-tracker](apps/commute-tracker) | TypeScript / Express / Firestore | Commute optimization tool — JWT auth, weather tracking, analytics |
| [art-studio](apps/art-studio) | TypeScript / Express | AI wall art generator — Gemini prompt enhancement + Stability AI SD3 |
| [chess-slots](apps/chess-slots) | Go | Chess-themed slot machine, all logic client-side |
| [escape-room](apps/escape-room) | TypeScript / Express | 2-player couch co-op puzzle game, no server state |

## Structure

```
hl-apps/
├── apps/
│   ├── art-studio/       # Each app is self-contained
│   ├── chess-slots/
│   ├── commute-tracker/
│   ├── db-test/
│   ├── escape-room/
│   └── test-app/
│       ├── app.py        # or src/index.ts, main.go
│       ├── Dockerfile
│       └── README.md
├── docs/
│   ├── design-guide.md          # Shared design language
│   ├── secrets-guide.md
│   └── unified-secrets-guide.md
└── README.md
```

## Conventions

- **Server-rendered HTML.** No frontend build step — each app serves its UI from a
  template literal in the server source.
- **Port 8080**, overridable via the `PORT` env var that Cloud Run injects.
- **Dual routes.** Every route is registered twice: bare (`/api/health`) for direct
  Cloud Run access, and prefixed (`/apps/<name>/api/health`) for the Firebase proxy.
- **Shared design language** — see [docs/design-guide.md](docs/design-guide.md).
  Ant Design components, grayscale-dominant palette, blue (`#1677ff`) accent.
- **Secrets** come from a single `app-secrets` JSON secret in Secret Manager, mounted
  as the `APP_SECRETS` env var — see
  [docs/unified-secrets-guide.md](docs/unified-secrets-guide.md).

## Development

```bash
cd apps/[app-name]
npm install && npm run dev     # TypeScript apps
go run main.go                 # chess-slots
pip install -r requirements.txt && python app.py   # test-app
```

Visit http://localhost:8080.

## Deployment

```bash
cd apps/[app-name]
gcloud run deploy [app-name] \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

Apps that need secrets add `--set-secrets="APP_SECRETS=app-secrets:latest"`.

To serve an app through Firebase Hosting, add it to `firebase.json`:

```json
{
  "source": "/apps/[app-name]",
  "run": { "serviceId": "[app-name]", "region": "us-central1" }
},
{
  "source": "/apps/[app-name]/**",
  "run": { "serviceId": "[app-name]", "region": "us-central1" }
}
```
