const wordDisplay = document.getElementById('word');
const wrongLettersDisplay = document.getElementById('wrong-letters');
const messageDisplay = document.getElementById('message');
const keyboard = document.getElementById('keyboard');
const playAgainBtn = document.getElementById('play-again');
const playerNameInput = document.getElementById('player-name');
const startBtn = document.getElementById('start-btn');
const historyList = document.getElementById('history');
const canvas = document.getElementById('hangman-canvas');
const ctx = canvas.getContext('2d');

const wordList = ['javascript', 'hangman', 'coding', 'html', 'css'];
let secretWord = '';
let correctLetters = [];
let wrongLetters = [];
let playerName = '';

// Draw hangman parts
function drawHangman(step) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000';

  const parts = [
    () => { ctx.beginPath(); ctx.moveTo(10, 190); ctx.lineTo(190, 190); ctx.stroke(); }, // base
    () => { ctx.beginPath(); ctx.moveTo(50, 190); ctx.lineTo(50, 20); ctx.stroke(); },   // pole
    () => { ctx.beginPath(); ctx.moveTo(50, 20); ctx.lineTo(120, 20); ctx.stroke(); },   // top
    () => { ctx.beginPath(); ctx.moveTo(120, 20); ctx.lineTo(120, 40); ctx.stroke(); },  // rope
    () => { ctx.beginPath(); ctx.arc(120, 55, 15, 0, Math.PI * 2); ctx.stroke(); },      // head
    () => { ctx.beginPath(); ctx.moveTo(120, 70); ctx.lineTo(120, 120); ctx.stroke(); }, // body
    () => { ctx.beginPath(); ctx.moveTo(120, 80); ctx.lineTo(100, 100); ctx.stroke(); }, // left arm
    () => { ctx.beginPath(); ctx.moveTo(120, 80); ctx.lineTo(140, 100); ctx.stroke(); }, // right arm
    () => { ctx.beginPath(); ctx.moveTo(120, 120); ctx.lineTo(100, 150); ctx.stroke(); },// left leg
    () => { ctx.beginPath(); ctx.moveTo(120, 120); ctx.lineTo(140, 150); ctx.stroke(); } // right leg
  ];

  if (step < parts.length) parts[step]();
}

// Setup a new game
function startGame() {
  secretWord = wordList[Math.floor(Math.random() * wordList.length)];
  correctLetters = [];
  wrongLetters = [];
  messageDisplay.textContent = '';
  wrongLettersDisplay.textContent = '';
  wordDisplay.textContent = '';
  playAgainBtn.style.display = 'none';
  keyboard.innerHTML = '';
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i).toLowerCase();
    const button = document.createElement('button');
    button.textContent = letter;
    button.onclick = () => handleGuess(letter, button);
    keyboard.appendChild(button);
  }

  displayWord();
}

function displayWord() {
  wordDisplay.innerHTML = secretWord
    .split('')
    .map(letter => (correctLetters.includes(letter) ? letter : '_'))
    .join(' ');
}

function updateWrongLetters() {
  wrongLettersDisplay.textContent = wrongLetters.join(', ');
  drawHangman(wrongLetters.length - 1);
  if (wrongLetters.length >= 10) {
    endGame('💀 You lost! The word was: ' + secretWord, false);
  }
}

function checkWin() {
  const isWinner = secretWord.split('').every(letter => correctLetters.includes(letter));
  if (isWinner) {
    endGame('🎉 You won!', true);
  }
}

function handleGuess(letter, button) {
  button.disabled = true;

  if (secretWord.includes(letter)) {
    if (!correctLetters.includes(letter)) {
      correctLetters.push(letter);
      displayWord();
      checkWin();
    }
  } else {
    if (!wrongLetters.includes(letter)) {
      wrongLetters.push(letter);
      updateWrongLetters();
    }
  }
}

function endGame(message, won) {
  messageDisplay.textContent = message;
  document.querySelectorAll('#keyboard button').forEach(btn => btn.disabled = true);
  playAgainBtn.style.display = 'inline-block';
  saveHistory(won);
}

function saveHistory(won) {
  const result = {
    word: secretWord,
    result: won ? 'Win' : 'Lose',
    date: new Date().toLocaleString()
  };

  let history = JSON.parse(localStorage.getItem(playerName)) || [];
  history.push(result);
  localStorage.setItem(playerName, JSON.stringify(history));
  showHistory();
}

function showHistory() {
  historyList.innerHTML = '';
  const history = JSON.parse(localStorage.getItem(playerName)) || [];
  history.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `[${entry.date}] - Word: ${entry.word} → ${entry.result}`;
    historyList.appendChild(li);
  });
}

startBtn.onclick = () => {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert('Please enter your name!');
    return;
  }
  playerName = name;
  document.getElementById('player-setup').style.display = 'none';
  showHistory();
  startGame();
};

playAgainBtn.onclick = startGame;
