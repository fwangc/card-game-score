# Card Game Score Tracker

This project supports **room-based server persistence** (scores stored in JSON files on the server).

## Run locally

```powershell
npm install
npm run dev
```

Open:
- View-only: `http://localhost:3000/?roomId=myroom`
- Edit: `http://localhost:3000/?roomId=myroom&master=true`

Scores are stored under `data/rooms/<roomId>.json`.

## Deploy (so it works anywhere)

GitHub Pages **cannot** save JSON on the server. Deploy the Node server (for example on Render/Fly/VPS).

After deploying, your app will work at your deployed URL:
- `...?roomId=myroom` (view)
- `...?roomId=myroom&master=true` (edit)

## Security note

Currently, writes are allowed when `master=true` (easy, but not secure).
For real protection, set an environment variable on the server:

- `ROOM_ADMIN_KEY=<some-secret>`

Then only requests with header `X-ROOM-ADMIN: <some-secret>` can write.

## One-click deploy on Render (shared room data)

This repo includes `render.yaml` with a persistent disk, so room JSON files survive restarts.

1. Open Render Blueprint new page: [https://dashboard.render.com/blueprints/new](https://dashboard.render.com/blueprints/new)
2. Select repo: `fwangc/card-game-score`
3. Keep defaults from `render.yaml` and deploy.
4. (Recommended) Add environment variable:
   - `ROOM_ADMIN_KEY=<a-secret-value>`

After deploy, use your Render URL:
- View-only: `https://<your-render-domain>/?roomId=myroom`
- Edit: `https://<your-render-domain>/?roomId=myroom&master=true`

Notes:
- If `ROOM_ADMIN_KEY` is set, write requests require header `X-ROOM-ADMIN`.
- Data is stored in JSON files under `/var/data/rooms` on the persistent disk.

