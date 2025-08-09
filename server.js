// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { status } = require('minecraft-server-util'); // npm install minecraft-server-util

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// Cambia esto a la IP/host de tu server
const MINECRAFT_HOST = '26.46.250.85';
const MINECRAFT_PORT = 25565;

app.get('/status', async (req, res) => {
  try {
    const result = await status(MINECRAFT_HOST, MINECRAFT_PORT, { timeout: 3000 });
    res.json({
      online: true,
      players: result.players ? { online: result.players.online, max: result.players.max } : null,
      version: result.version ? result.version.name : undefined,
      motd: result.motd ? (result.motd.clean || result.motd) : undefined
    });
  } catch (err) {
    res.json({ online: false });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor de estado corriendo en http://localhost:${PORT}`);
});
