const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
let radius = canvas.width / 2;
let names = [];
let currentAngle = 0;
let spinning = false;
const sliceColors = [
  '#feca57', // giallo
  '#48dbfb', // azzurro
  '#1dd1a1', // verde acqua
  '#ff6b6b', // rosso
  '#a29bfe', // lilla
  '#fd79a8', // rosa
  '#00b894', // verde
  '#e17055', // arancione
  '#636e72', // grigio scuro
  '#ffeaa7'  // giallo chiaro
];

// Ruota lenta con valori casuali all'avvio
let idleNames = ["Mario", "Luca", "Anna", "Sara", "Paolo"];
let idleAngle = 0;
let idleSpinActive = true;

function startIdleSpin() {
  names = [...idleNames];
  drawWheel();
  function idleSpin() {
    if (!idleSpinActive) return;
    idleAngle += 0.005; // velocità lenta
    currentAngle = idleAngle;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(currentAngle);
    ctx.translate(-radius, -radius);
    drawWheel();
    ctx.restore();
    requestAnimationFrame(idleSpin);
  }
  idleSpin();
}
startIdleSpin();

function drawWheel() {
  const sliceAngle = (2 * Math.PI) / names.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < names.length; i++) {
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.fillStyle = sliceColors[i % sliceColors.length];
    ctx.arc(radius, radius, radius - 10, i * sliceAngle, (i + 1) * sliceAngle);
    ctx.fill();
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(i * sliceAngle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#222';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(names[i], radius - 20, 5);
    ctx.restore();
  }

  // --- DISEGNA PALETTI TRA GLI SPICCHI ---
  ctx.save();
  ctx.translate(radius, radius);
  for (let i = 0; i < names.length; i++) {
    ctx.save();
    ctx.rotate(i * sliceAngle);
    ctx.beginPath();
    ctx.moveTo(radius - 10, 0); // dal bordo interno
    ctx.lineTo(radius, 0);      // al bordo esterno
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#222';
    ctx.shadowBlur = 2;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function spinWheel() {
  if (spinning) return;
  const input = document.getElementById('nameInput').value.trim();
  names = input.split('\n').map(n => n.trim()).filter(n => n !== '');
  console.log(names);
  if (names.length < 2) {
    alert("Inserisci almeno 2 nomi.");
      console.log(names);
    return;
  }

  drawWheel();

  const indicator = document.getElementById('indicator');
  const tickSound = document.getElementById('tickSound');
  spinning = true;
  let rotation = 0;
  const sliceAngle = (2 * Math.PI) / names.length;
  const targetAngle = Math.random() * 360 + 360 * 5;
  const duration = 4000;
  const start = performance.now();
  let lastIndex = -1;

  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    rotation = easeOut * targetAngle;
    currentAngle = rotation * Math.PI / 180;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(currentAngle);
    ctx.translate(-radius, -radius);
    drawWheel();
    ctx.restore();

    const index = Math.floor(((2 * Math.PI - (currentAngle - Math.PI / 2) + 2 * Math.PI) % (2 * Math.PI)) / sliceAngle);

    if (index !== lastIndex) {
      indicator.classList.remove('twitch');
      void indicator.offsetWidth; // forza il reflow per ri-triggerare l'animazione
      indicator.classList.add('twitch');
      // Suono tick
      if (tickSound) {
        tickSound.currentTime = 0;
        tickSound.play();
      }
      lastIndex = index;
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      showWinnerFromAngle();
    }
  }

  requestAnimationFrame(animate);
}

function showWinner(index) {
  const winner = names[index];
    console.log(names);
  document.getElementById('popupName').textContent = winner || 'Errore';
  document.getElementById('winnerPopup').classList.remove('hidden');
  launchConfetti();
}

function closePopup() {
  document.getElementById('winnerPopup').classList.add('hidden');
}

function launchConfetti() {
  for (let i = 0; i < 100; i++) {
    const conf = document.createElement('div');
    conf.classList.add('confetti');
    conf.style.left = Math.random() * 100 + 'vw';
    conf.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    conf.style.animationDuration = 2 + Math.random() * 2 + 's';
    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), 4000);
  }
}

function showWinnerFromAngle() {
  if (!Array.isArray(names) || names.length < 2) {
    document.getElementById('popupName').textContent = "Inserisci almeno 2 nomi validi";
    document.getElementById('winnerPopup').classList.remove('hidden');
    return;
  }

  const sliceAngle = (2 * Math.PI) / names.length;

  // L'angolo verso nord (alto) è -Math.PI/2. Ruotiamo all'indietro di currentAngle.
  let northAngle = (-Math.PI / 2 - currentAngle) % (2 * Math.PI);
  if (northAngle < 0) northAngle += 2 * Math.PI;

  // Trova il settore corrispondente
  let index = Math.floor(northAngle / sliceAngle) % names.length;

  const winner = names[index];

  document.getElementById('popupName').textContent = winner || "Errore nel calcolo";
  document.getElementById('winnerPopup').classList.remove('hidden');
  launchConfetti();
}

// Aggiorna la ruota in tempo reale quando cambia la textarea
document.getElementById('nameInput').addEventListener('input', function() {
  const input = this.value.trim();
  names = input.split('\n').map(n => n.trim()).filter(n => n !== '');
  if (names.length > 0) {
    idleSpinActive = false; // Ferma la ruota idle
    drawWheel();
  } else {
    idleSpinActive = true;
    startIdleSpin();
  }
});

function resizeCanvas() {
  const size = Math.min(window.innerWidth * 0.9, 400);
  canvas.width = size;
  canvas.height = size;
  radius = canvas.width / 2; // <-- aggiorna il raggio!
}
// All'inizio del file, dopo aver preso il canvas:
resizeCanvas();
window.addEventListener('resize', () => {
  resizeCanvas();
  drawWheel();
});

