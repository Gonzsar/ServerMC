const statusEl = document.getElementById('status');
const playersEl = document.getElementById('players');
const countdownEl = document.getElementById('countdown');
const clockEl = document.getElementById('clock');
const confettiContainer = document.getElementById('confetti-container');
const audio = new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');

let lastStatusOnline = false;
let firstRun = true;

// --- Helpers para hora en America/Montevideo ---
function getTZParts() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Montevideo',
    hour12: false,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).formatToParts(now).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second)
  };
}

function pad(n){ return String(n).padStart(2,'0'); }

// --- Reloj ---
function updateClock() {
  const t = getTZParts();
  clockEl.textContent = `${pad(t.hour)}:${pad(t.minute)}:${pad(t.second)}`;
}

// --- Countdown ---
function formatDurationSec(totalSec){
  if (totalSec < 0) totalSec = 0;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function updateCountdown(){
  const t = getTZParts();
  const hour = t.hour, minute = t.minute, second = t.second;
  const nowSec = hour*3600 + minute*60 + second;
  const openHour = 13; // 13:00
  const closeHour = 3;  // 03:00

  let secondsUntil = 0;
  let message = '';

  if (hour >= openHour || hour < closeHour) {
    if (hour >= openHour) {
      const secsToMidnight = (24*3600) - nowSec;
      secondsUntil = secsToMidnight + (closeHour*3600);
    } else {
      secondsUntil = (closeHour*3600) - nowSec;
    }
    message = `Cierra en: ${formatDurationSec(Math.floor(secondsUntil))}`;
  } else {
    if (hour < openHour) {
      secondsUntil = (openHour*3600) - nowSec;
    } else {
      const secsToMidnight = (24*3600) - nowSec;
      secondsUntil = secsToMidnight + (openHour*3600);
    }
    message = `Abre en: ${formatDurationSec(Math.floor(secondsUntil))}`;
  }

  countdownEl.textContent = message;
}

// --- Confetti ---
function createConfetti(){
  for (let i = 0; i < 30; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = `${Math.random() * 100}vw`;
    c.style.backgroundColor = `hsl(${Math.random() * 50 + 10}, 80%, 60%)`;
    c.style.animationDelay = (Math.random() * 1.2) + 's';
    confettiContainer.appendChild(c);
    setTimeout(()=> c.remove(), 3500);
  }
}

function bigConfetti() {
  const end = Date.now() + 1500;
  (function frame() {
    confetti({
      particleCount: 10,
      startVelocity: 30,
      spread: 360,
      origin: { x: Math.random(), y: Math.random() - 0.2 }
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}


// --- Notificaciones y sonido ---
function notifyOnline() {
  try {
    audio.currentTime = 0;
    audio.volume = 0.7;
    audio.play().catch(()=>{});
  } catch(e){}
  if (!firstRun && "Notification" in window && Notification.permission === "granted") {
    new Notification("Servidor Minecraft", { body: "Está ONLINE 🎉" });
  }
}
function notifyOffline(){
  if (!firstRun && "Notification" in window && Notification.permission === "granted") {
    new Notification("Servidor Minecraft", { body: "Se puso OFFLINE" });
  }
}

// --- Estado según hora ---
function fetchStatus() {
  const tz = getTZParts();
  const hour = tz.hour;
  const isOpenHours = (hour >= 13) || (hour < 3);

  if (isOpenHours) {
    if (!lastStatusOnline) {
      notifyOnline();
      createConfetti();
    }
    lastStatusOnline = true;
    statusEl.className = 'status online';
    statusEl.querySelector('.status-text').innerHTML = '<span class="pulse">🟢</span> ONLINE';
    playersEl.textContent = '🎮 Vení a jugar gil';
  } else {
    if (lastStatusOnline) notifyOffline();
    lastStatusOnline = false;
    statusEl.className = 'status offline';
    statusEl.querySelector('.status-text').innerHTML = '<span class="pulse">🔴</span> OFFLINE';
    playersEl.textContent = 'Fuiste, ta cerrado';
  }

  firstRun = false;
}


// --- Partículas ---
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
function resizeCanvas(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let particles = [];
const PARTICLE_COUNT = 150;

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const size = Math.random() * 3 + 1;
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size,
    alpha: Math.random() * 0.2 + 0.05,
    speedX: (Math.random() - 0.5) * 0.8,
    speedY: (Math.random() - 0.5) * 0.8,
    flicker: Math.random() > 0.7 // ~30% parpadean
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(p => {
    // Si parpadea, cambiar opacidad lentamente
    if (p.flicker) {
      p.alpha += (Math.random() - 0.5) * 0.02; 
      if (p.alpha < 0.05) p.alpha = 0.05;
      if (p.alpha > 0.3) p.alpha = 0.3;
    }

    ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    // Movimiento
    p.x += p.speedX;
    p.y += p.speedY;

    // Teletransporte cuando sale de pantalla
    if (p.x < -10) p.x = canvas.width + 10;
    if (p.x > canvas.width + 10) p.x = -10;
    if (p.y < -10) p.y = canvas.height + 10;
    if (p.y > canvas.height + 10) p.y = -10;
  });

  requestAnimationFrame(drawParticles);
}


// --- Permiso notificaciones ---
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission().catch(()=>{});
}

// --- Intervalos ---
setInterval(updateCountdown, 1000);
setInterval(fetchStatus, 5000);

updateCountdown();
fetchStatus();
drawParticles();
