const statusEl = document.getElementById('status');
const playersEl = document.getElementById('players');
const countdownEl = document.getElementById('countdown');
const pulseEl = document.querySelector('.pulse-indicator');
const confettiContainer = document.getElementById('confetti-container');

let confettiActive = false;
let prevTime = "";

// Crear estructura flip clock
function initFlipClock() {
  countdownEl.innerHTML = `
    <div class="flip-group" id="hours">
      <div class="flip-digit"><div class="flip-card current">0</div><div class="flip-card next">0</div></div>
      <div class="flip-digit"><div class="flip-card current">0</div><div class="flip-card next">0</div></div>
    </div>
    <div class="flip-separator">:</div>
    <div class="flip-group" id="minutes">
      <div class="flip-digit"><div class="flip-card current">0</div><div class="flip-card next">0</div></div>
      <div class="flip-digit"><div class="flip-card current">0</div><div class="flip-card next">0</div></div>
    </div>
    <div class="flip-separator">:</div>
    <div class="flip-group" id="seconds">
      <div class="flip-digit"><div class="flip-card current">0</div><div class="flip-card next">0</div></div>
      <div class="flip-digit"><div class="flip-card current">0</div><div class="flip-card next">0</div></div>
    </div>
  `;
}

function flipDigit(groupId, index, newNumber) {
  const group = document.getElementById(groupId);
  const digit = group.children[index];
  const currentCard = digit.querySelector('.current');
  const nextCard = digit.querySelector('.next');

  if (currentCard.textContent == newNumber) return;

  nextCard.textContent = newNumber;
  currentCard.classList.add('flip-animate');

  setTimeout(() => {
    currentCard.textContent = newNumber;
    currentCard.classList.remove('flip-animate');
  }, 300);
}

function updateCountdown() {
  const now = new Date();
  const openHour = 13;
  const closeHour = 3;

  const openTime = new Date(now);
  openTime.setHours(openHour, 0, 0, 0);

  const closeTime = new Date(now);
  if (now.getHours() < closeHour) closeTime.setDate(closeTime.getDate());
  else closeTime.setDate(closeTime.getDate() + 1);
  closeTime.setHours(closeHour, 0, 0, 0);

  let diff;
  if (now < openTime) {
    diff = openTime - now;
    pulseEl.style.background = "grey";
  } else if (now >= openTime && now < closeTime) {
    diff = closeTime - now;
    pulseEl.style.background = "var(--online-color)";
  } else {
    diff = openTime.getTime() + 86400000 - now.getTime();
    pulseEl.style.background = "grey";
  }

  const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  const newTime = h + m + s;

  if (prevTime) {
    if (newTime[0] !== prevTime[0]) flipDigit('hours', 0, newTime[0]);
    if (newTime[1] !== prevTime[1]) flipDigit('hours', 1, newTime[1]);
    if (newTime[2] !== prevTime[2]) flipDigit('minutes', 0, newTime[2]);
    if (newTime[3] !== prevTime[3]) flipDigit('minutes', 1, newTime[3]);
    if (newTime[4] !== prevTime[4]) flipDigit('seconds', 0, newTime[4]);
    if (newTime[5] !== prevTime[5]) flipDigit('seconds', 1, newTime[5]);
  }

  prevTime = newTime;
}

function createConfetti() {
  const colors = ['#4ade80', '#22c55e', '#16a34a', '#bbf7d0', '#86efac', '#fff176', '#81d4fa'];
  const shapes = ['circle', 'square'];
  const count = 40;

  for (let i = 0; i < count; i++) {
    const div = document.createElement('div');
    div.classList.add('confetti');
    div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    div.style.left = Math.random() * 100 + 'vw';
    div.style.animationDuration = 2 + Math.random() * 3 + 's';
    div.style.borderRadius = shapes[Math.floor(Math.random()*shapes.length)] === 'circle' ? '50%' : '0';
    confettiContainer.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  }
}

async function fetchStatus() {
  try {
    const res = await fetch('/status');
    const data = await res.json();

    if (data.online) {
      statusEl.className = 'status online';
      statusEl.querySelector('.status-text').textContent = '✅ Servidor en línea';
      playersEl.textContent = `👥 Jugadores: ${data.players ?? 'N/A'}`;
      if (!confettiActive) {
        createConfetti();
        confettiActive = true;
      }
      document.body.style.background = 'linear-gradient(135deg, #0f172a, #1a4d2e)';
    } else {
      statusEl.className = 'status offline';
      statusEl.querySelector('.status-text').textContent = '❌ Servidor offline';
      playersEl.textContent = '';
      confettiActive = false;
      document.body.style.background = 'var(--bg-dark)';
    }
  } catch {
    statusEl.className = 'status offline';
    statusEl.querySelector('.status-text').textContent = '⚠️ Error al obtener estado';
    playersEl.textContent = '';
    confettiActive = false;
    document.body.style.background = 'var(--bg-dark)';
  }
}

function loop() {
  updateCountdown();
  fetchStatus();
}

initFlipClock();
setInterval(loop, 1000);
loop();
