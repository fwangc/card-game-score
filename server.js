const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs/promises");

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data", "rooms");

function normalizeRoomId(roomId) {
  const id = String(roomId || "").trim();
  if (!id) return null;
  if (id.length > 50) return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return null;
  return id;
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function roomFilePath(roomId) {
  return path.join(DATA_DIR, `${roomId}.json`);
}

async function readRoom(roomId) {
  const file = roomFilePath(roomId);
  const raw = await fs.readFile(file, "utf8");
  const parsed = JSON.parse(raw);

  const players = Array.isArray(parsed?.players) ? parsed.players : [];
  return {
    roomId,
    players: players
      .filter((p) => p && typeof p.name === "string" && typeof p.score === "number")
      .map((p) => ({ name: p.name, score: p.score }))
  };
}

async function writeRoom(roomId, players) {
  const file = roomFilePath(roomId);
  const payload = {
    roomId,
    updatedAt: new Date().toISOString(),
    players
  };
  await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf8");
}

function canWrite(req) {
  // IMPORTANT: `?master=true` is NOT secure — anyone can set it.
  // If you set ROOM_ADMIN_KEY on the server, then writes require header:
  //   X-ROOM-ADMIN: <ROOM_ADMIN_KEY>
  const key = process.env.ROOM_ADMIN_KEY;
  if (key) {
    return req.header("X-ROOM-ADMIN") === key;
  }
  return req.query.master === "true";
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "256kb" }));

// Serve the frontend (index.html) from repo root
app.use(express.static(__dirname));

app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/rooms/:roomId", async (req, res) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId);
    if (!roomId) return res.status(400).json({ error: "Invalid roomId" });

    await ensureDataDir();

    try {
      const room = await readRoom(roomId);
      return res.json(room);
    } catch (err) {
      if (err && err.code === "ENOENT") {
        return res.json({ roomId, players: [] });
      }
      throw err;
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to load room" });
  }
});

app.put("/api/rooms/:roomId", async (req, res) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId);
    if (!roomId) return res.status(400).json({ error: "Invalid roomId" });
    if (!canWrite(req)) return res.status(403).json({ error: "Not authorized" });

    const players = Array.isArray(req.body?.players) ? req.body.players : null;
    if (!players) return res.status(400).json({ error: "Body must include players[]" });

    const cleaned = players
      .filter((p) => p && typeof p.name === "string" && typeof p.score === "number")
      .map((p) => ({ name: p.name, score: p.score }));

    await ensureDataDir();
    await writeRoom(roomId, cleaned);
    return res.json({ ok: true, roomId, players: cleaned });
  } catch (err) {
    return res.status(500).json({ error: "Failed to save room" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

