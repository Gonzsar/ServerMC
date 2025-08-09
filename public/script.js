// ===== CONFIGURACIÓN =====
const MC_SERVER_IP = "26.46.250.85"; // Cambia por tu IP o dominio
const MC_SERVER_PORT = 25565; // Cambia si tu server usa otro puerto

const statusEl = document.getElementById('status');
const playersEl = document.getElementById('players');
const countdownEl = document.getElementById('countdown');
const clockEl = document.getElementById('clock');
const confettiContainer = document.getElementById('confetti-container');
const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');


let lastStatusOnline = false;

async function fetchStatus() {
  try {
    const res = await fetch(`/status`);
    const data = await res.json();

    if (data.online) {
      if (!lastStatusOnline) {
        audio.play();
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Servidor Minecraft está ONLINE 🎉");
        }
      }
      lastStatusOnline = true;
      // ... tu código actual para mostrar online
    } else {
      if (lastStatusOnline) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Servidor Minecraft está OFFLINE");
        }
      }
      lastStatusOnline = false;
      // ... tu código actual para mostrar offline
    }
  } catch {
    // ...
  }
}

// Pedir permiso de notificaciones al cargar
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}


// === Reloj en vivo ===
function updateClock() {
  const now = new Date();
  clockEl.textContent = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// === Confeti cuando el server está online ===
function createConfetti() {
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.backgroundColor = `hsl(${Math.random() * 120}, 80%, 60%)`;
    confetti.style.animationDelay = `${Math.random()}s`;
    confettiContainer.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}

// === Cuenta regresiva para apertura/cierre ===
function formatDuration(ms) {
  let s = Math.floor(ms / 1000);
  let h = Math.floor(s / 3600);
  s %= 3600;
  let m = Math.floor(s / 60);
  s %= 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateCountdown() {
  const now = new Date();
  const openHour = 13; // 13:00
  const closeHour = 3; // 03:00

  const openTime = new Date(now);
  openTime.setHours(openHour, 0, 0, 0);

  const closeTime = new Date(now);
  if (now.getHours() < closeHour) {
    closeTime.setHours(closeHour, 0, 0, 0);
  } else {
    closeTime.setDate(closeTime.getDate() + 1);
    closeTime.setHours(closeHour, 0, 0, 0);
  }

  let diff, msg;
  if (now < openTime) {
    diff = openTime - now;
    msg = `Abre en: ${formatDuration(diff)}`;
  } else if (now >= openTime && now < closeTime) {
    diff = closeTime - now;
    msg = `Cierra en: ${formatDuration(diff)}`;
  } else {
    diff = openTime.getTime() + 86400000 - now.getTime();
    msg = `Abre en: ${formatDuration(diff)}`;
  }

  countdownEl.textContent = msg;
}

// === Consulta estado del servidor Minecraft ===
async function fetchStatus() {
  try {
    const res = await fetch(`https://api.mcsrvstat.us/2/${MC_SERVER_IP}:${MC_SERVER_PORT}`);
    const data = await res.json();

    if (data.online) {
      statusEl.className = 'status online';
      statusEl.querySelector('.status-text').textContent = '✅ En línea';
      playersEl.textContent = `Jugadores: ${data.players?.online ?? 0} / ${data.players?.max ?? "?"}`;
      createConfetti();
    } else {
      statusEl.className = 'status offline';
      statusEl.querySelector('.status-text').textContent = '❌ Offline';
      playersEl.textContent = '';
    }
  } catch (err) {
    statusEl.className = 'status offline';
    statusEl.querySelector('.status-text').textContent = '⚠️ Error';
    playersEl.textContent = '';
  }
}

// === Partículas de fondo ===
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
for (let i = 0; i < 50; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2 + 1,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: (Math.random() - 0.5) * 0.5
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    p.x += p.speedX;
    p.y += p.speedY;
    if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
    if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
  });
  requestAnimationFrame(drawParticles);
}

// === Intervalos ===
// Reloj y cuenta regresiva: 1s
setInterval(() => {
  updateCountdown();
}, 1000);

// Estado del servidor: 5s
setInterval(fetchStatus, 5000);

// Primera ejecución inmediata
updateCountdown();
fetchStatus();
drawParticles();
