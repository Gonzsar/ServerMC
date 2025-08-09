async function fetchStatus() {
  const statusEl = document.getElementById('status');
  const playersEl = document.getElementById('players');

  try {
    const res = await fetch('/status');
    const data = await res.json();

    if (data.online) {
      statusEl.textContent = '✅ Servidor en línea';
      statusEl.className = 'status online';
      playersEl.textContent = `Jugadores conectados: ${data.players ?? 'N/A'}`;
    } else {
      statusEl.textContent = '❌ Servidor fuera de servicio';
      statusEl.className = 'status offline';
      playersEl.textContent = data.reason || '';
    }
  } catch (error) {
    statusEl.textContent = '⚠️ Error al obtener estado';
    statusEl.className = 'status offline';
    playersEl.textContent = '';
  }
}

// Actualiza cada 7 segundos
setInterval(fetchStatus, 7000);
fetchStatus();
