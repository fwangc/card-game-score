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

