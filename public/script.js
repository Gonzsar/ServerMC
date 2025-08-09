const statusEl = document.getElementById('status');
const playersEl = document.getElementById('players');
const countdownEl = document.getElementById('countdown');
const confettiContainer = document.getElementById('confetti-container');

let confettiActive = false;

function createConfetti() {
  const colors = ['#4ade80', '#22c55e', '#16a34a', '#bbf7d0', '#86efac'];
  const confettiCount = 30;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDelay = (Math.random() * 1.5) + 's';
    confetti.style.opacity = 0.9;
    confettiContainer.appendChild(confetti);
  }

  setTimeout(() => {
    confettiContainer.innerHTML = '';
    confettiActive = false;
  }, 5000);
}

function updateCountdown() {
  const now = new Date();

  // Horario abierto: 13:00 - 03:00 (del día siguiente)
  let openHour = 13;
  let closeHour = 3;
  
  let openTime = new Date(now);
  openTime.setHours(openHour, 0, 0, 0);

  let closeTime = new Date(now);
  // Si la hora actual es antes de 3 AM, el cierre es el mismo día (mañana)
  if (now.getHours() < closeHour) {
    closeTime.setDate(closeTime.getDate());
  } else {
    // Si es después de 3 AM, el cierre es el día siguiente
    closeTime.setDate(closeTime.getDate() + 1);
  }
  closeTime.setHours(closeHour, 0, 0, 0);

  let diff, message;

  if (now < openTime) {
    diff = openTime - now;
    message = `Abre en: ${formatDuration(diff)}`;
  } else if (now >= openTime && now < closeTime) {
    diff = closeTime - now;
    message = `Cierra en: ${formatDuration(diff)}`;
  } else {
    // Si estamos entre 3am y 13pm, está cerrado
    diff = openTime.getTime() + 86400000 - now.getTime(); // para el siguiente día
    message = `Abre en: ${formatDuration(diff)}`;
  }

  countdownEl.textContent = message;
}

function formatDuration(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let h = Math.floor(totalSeconds / 3600);
  let m = Math.floor((totalSeconds % 3600) / 60);
  let s = totalSeconds % 60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

async function fetchStatus() {
  try {
    const res = await fetch('/status');
    const data = await res.json();

    if (data.online) {
      if (!confettiActive) {
        createConfetti();
        confettiActive = true;
      }
      statusEl.className = 'status online';
      statusEl.querySelector('.status-text').textContent = '✅ Servidor en línea';
      playersEl.textContent = `Jugadores conectados: ${data.players ?? 'N/A'}`;
    } else {
      statusEl.className = 'status offline';
      statusEl.querySelector('.status-text').textContent = '❌ Servidor fuera de servicio';
      playersEl.textContent = data.reason || '';
      confettiContainer.innerHTML = '';
      confettiActive = false;
    }
  } catch {
    statusEl.className = 'status offline';
    statusEl.querySelector('.status-text').textContent = '⚠️ Error al obtener estado';
    playersEl.textContent = '';
    confettiContainer.innerHTML = '';
    confettiActive = false;
  }
}

function loop() {
  updateCountdown();
  fetchStatus();
}

setInterval(loop, 7000);
loop();
