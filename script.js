/* ============================================================
   Tic Tac Toe – Ocean Glassmorphism
   Features: Score Tracker, Draw Detection, Turn Indicator,
             Sound Effects, Bubble Animation, Ripple Effect
   ============================================================ */

/* ── DOM References ── */
const boxes        = document.querySelectorAll('.box');
const turnBar      = document.getElementById('turnBar');
const turnSymbol   = document.getElementById('turnSymbol');
const resultOverlay = document.getElementById('resultOverlay');
const resultIcon   = document.getElementById('resultIcon');
const resultMsg    = document.getElementById('resultMsg');
const scoreONum    = document.getElementById('scoreONum');
const scoreXNum    = document.getElementById('scoreXNum');
const scoreDrawNum = document.getElementById('scoreDrawNum');
const scoreOCard   = document.getElementById('scoreO');
const scoreXCard   = document.getElementById('scoreX');
const scoreDrawCard = document.getElementById('scoreDraw');

/* ── Game State ── */
const WIN_PATTERNS = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [3, 4, 5],
  [6, 7, 8],
];

let turnO    = true;
let gameOver = false;
let scores   = { O: 0, X: 0, draw: 0 };

/* ── Audio (Web Audio API – no external files needed) ── */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playClick() {
  try {
    const ac = getAudioCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.frequency.setValueAtTime(660, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ac.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
    osc.start();
    osc.stop(ac.currentTime + 0.12);
  } catch (_) {}
}

function playWin() {
  try {
    const ac = getAudioCtx();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ac.currentTime + i * 0.14;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  } catch (_) {}
}

function playDraw() {
  try {
    const ac = getAudioCtx();
    [330, 294, 262].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.frequency.value = freq;
      const t = ac.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  } catch (_) {}
}

/* ── Floating Bubbles ── */
function makeBubbles() {
  for (let i = 0; i < 18; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = 10 + Math.random() * 40;
    bubble.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}vw;
      animation-duration: ${8 + Math.random() * 14}s;
      animation-delay: ${Math.random() * 12}s;
      opacity: ${0.3 + Math.random() * 0.5};
    `;
    document.body.appendChild(bubble);
  }
}

/* ── Ripple Effect on Box Click ── */
function addRipple(btn, event) {
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${(event.clientX - rect.left) - size / 2}px;
    top: ${(event.clientY - rect.top) - size / 2}px;
  `;
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

/* ── Turn Indicator ── */
function updateTurnBar() {
  const sym = turnO ? 'O' : 'X';
  turnSymbol.textContent = sym;
  turnSymbol.className = `turn-symbol ${sym}`;
  turnBar.style.opacity = gameOver ? '0.35' : '1';
}

/* ── Score Bump Animation ── */
function bumpScore(card) {
  card.classList.remove('bump');
  void card.offsetWidth; // force reflow to restart animation
  card.classList.add('bump');
  card.addEventListener('animationend', () => card.classList.remove('bump'), { once: true });
}

/* ── Show Result Overlay ── */
function showResult(winner) {
  if (winner === 'draw') {
    resultIcon.textContent = '~';
    resultIcon.className = 'result-icon draw';
    resultMsg.innerHTML = `It's a <strong>Draw!</strong>`;
    scores.draw++;
    scoreDrawNum.textContent = scores.draw;
    bumpScore(scoreDrawCard);
    playDraw();
  } else {
    resultIcon.textContent = winner;
    resultIcon.className = `result-icon ${winner}`;
    resultMsg.innerHTML = `Player <span class="${winner}">${winner}</span> Wins! 🎉`;
    scores[winner]++;
    if (winner === 'O') {
      scoreONum.textContent = scores.O;
      bumpScore(scoreOCard);
    } else {
      scoreXNum.textContent = scores.X;
      bumpScore(scoreXCard);
    }
    playWin();
  }
  resultOverlay.classList.add('show');
  gameOver = true;
  updateTurnBar();
}

/* ── Check Winner / Draw ── */
function checkWinner() {
  for (const [a, b, c] of WIN_PATTERNS) {
    const va = boxes[a].textContent;
    const vb = boxes[b].textContent;
    const vc = boxes[c].textContent;
    if (va && va === vb && vb === vc) {
      [boxes[a], boxes[b], boxes[c]].forEach(box => {
        box.classList.add('winner-box', va);
      });
      setTimeout(() => showResult(va), 320);
      return true;
    }
  }
  // Draw detection — all boxes filled with no winner
  if ([...boxes].every(box => box.textContent !== '')) {
    setTimeout(() => showResult('draw'), 320);
    return true;
  }
  return false;
}

/* ── Box Click Handler ── */
boxes.forEach(box => {
  box.addEventListener('click', event => {
    if (box.disabled || box.textContent || gameOver) return;

    playClick();
    addRipple(box, event);

    const sym = turnO ? 'O' : 'X';
    box.textContent = sym;
    box.classList.add(sym, 'placed');
    box.disabled = true;

    turnO = !turnO;
    updateTurnBar();
    checkWinner();
  });
});

/* ── Reset Game ── */
function resetGame() {
  gameOver = false;
  turnO = true;
  resultOverlay.classList.remove('show');
  boxes.forEach(box => {
    box.textContent = '';
    box.disabled = false;
    box.className = 'box';
  });
  updateTurnBar();
}

/* ── Button Listeners ── */
document.getElementById('newGameBtn').addEventListener('click', resetGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);
document.getElementById('clearScoreBtn').addEventListener('click', () => {
  scores = { O: 0, X: 0, draw: 0 };
  scoreONum.textContent = '0';
  scoreXNum.textContent = '0';
  scoreDrawNum.textContent = '0';
});

/* ── Init ── */
makeBubbles();
updateTurnBar();
