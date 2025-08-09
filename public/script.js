async function checkStatus() {
  try {
    const res = await fetch('/status');
    const data = await res.json();

    const statusDiv = document.getElementById('status');
    const playersDiv = document.getElementById('players');

    if (data.online) {
      statusDiv.textContent = '🟢 Servidor en línea';
      statusDiv.className = 'status online';
      playersDiv.textContent = `Jugadores: ${data.players.online}/${data.players.max}`;
    } else {
      statusDiv.textContent = '🔴 Servidor fuera de línea';
      statusDiv.className = 'status offline';
      playersDiv.textContent = '';
    }
  } catch (err) {
    console.error(err);
  }
}

// Refrescar cada 10 segundos
setInterval(checkStatus, 10000);
checkStatus();
