const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const radius = canvas.width / 2;
let names = [];
let currentAngle = 0;
let spinning = false;

function drawWheel() {
  const sliceAngle = (2 * Math.PI) / names.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < names.length; i++) {
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.fillStyle = i % 2 === 0 ? '#feca57' : '#48dbfb';
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

 // ctx.beginPath();
  //ctx.arc(radius, radius, radius - 5, 0, 2 * Math.PI);
  //ctx.strokeStyle = '#222';
  //ctx.lineWidth = 10;
  //ctx.stroke();
}

function spinWheel() {
  if (spinning) return;
  const input = document.getElementById('nameInput').value.trim();
  names = input.split('\n').filter(name => name.trim() !== '');
  if (names.length < 2) {
    alert("Inserisci almeno 2 nomi.");
    return;
  }

  const indicator = document.getElementById('indicator');
  let lastIndex = -1;
  const tickSound = document.getElementById('tickSound');
  spinning = true;
  let rotation = 0;
  const sliceAngle = (2 * Math.PI) / names.length;
  const targetAngle = Math.random() * 360 + 360 * 5;
  const duration = 4000;
  const start = performance.now();

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

    const currentIndex = Math.floor((2 * Math.PI - (currentAngle % (2 * Math.PI))) / sliceAngle);
    if (currentIndex !== lastIndex) {
      tickSound.currentTime = 0;
      tickSound.play();
      indicator.classList.remove('twitch');
      void indicator.offsetWidth;
      indicator.classList.add('twitch');
      lastIndex = currentIndex;
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      showWinner();
    }
  }

  requestAnimationFrame(animate);
}

function showWinner() {
  const sliceAngle = 2 * Math.PI / names.length;
  const normalizedAngle = (2 * Math.PI - (currentAngle % (2 * Math.PI))) % (2 * Math.PI);
  const index = Math.floor(normalizedAngle / sliceAngle);
  const winner = names[index];
  document.getElementById('popupName').textContent = winner;
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

ctx.fillStyle = '#ddd';
ctx.beginPath();
ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
ctx.fill();
ctx.fillStyle = '#333';
ctx.font = '18px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('Inserisci i nomi e premi "Gira la Ruota"', radius, radius);
