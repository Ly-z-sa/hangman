const nameScreen = document.getElementById('name-screen');
const gameScreen = document.getElementById('game-screen');
const playerNameInput = document.getElementById('player-name');
const startBtn = document.getElementById('start-btn');
const keyboard = document.getElementById('keyboard');
const wordDisplay = document.getElementById('word');
const wrongLettersDisplay = document.getElementById('wrong-letters');
const guessesInfoDisplay = document.getElementById('guesses-info');
const messageDisplay = document.getElementById('message');
const playAgainBtn = document.getElementById('play-again');
const showHistoryBtn = document.getElementById('show-history-btn');
const historyModal = document.getElementById('history-modal');
const closeHistoryBtn = document.getElementById('close-history');
const historyList = document.getElementById('history-list');
const canvas = document.getElementById('hangman-canvas');
const ctx = canvas.getContext('2d');
const nameErrorMessage = document.getElementById('name-error-message');
const categoryNameDisplay = document.getElementById('category-name');

const wordCategories = [
  { category: "Fruits", words: ["apple", "banana", "mango", "grape", "lemon", "orange", "peach", "pear", "plum", "berry", "cherry", "kiwi", "strawberry"] },
  { category: "Animals", words: ["tiger", "lion", "bear", "wolf", "horse", "sheep", "snake", "eagle", "shark", "mouse", "rabbit", "turtle", "slipperydick"] },
  { category: "Countries", words: ["china", "india", "japan", "brazil", "egypt", "italy", "spain", "peru", "kenya", "iran", "mexico", "canada", "cambodia", "united kingdom", "united state of america", ] },
  { category: "In the Kitchen", words: ["spoon", "fork", "knife", "plate", "glass", "stove", "oven", "mixer", "blender", "toast", "bowl", "pan"] },
  { category: "Around the House", words: ["chair", "table", "couch", "clock", "radio", "plant", "mirror", "shelf", "frame", "light", "door", "window"] },
  { category: "Nature", words: ["river", "cloud", "stone", "field", "bloom", "creek", "grove", "ridge", "shore", "trail", "breeze", "petal"] },
  { category: "Colors", words: ["green", "blue", "yellow", "black", "white", "purple", "silver", "brown", "pink", "azure", "ivory", "gold", "cyan"] }
];

let secretWord = '';
let currentCategoryName = '';
let correctLetters = [];
let wrongLetters = [];
let playerName = '';
let gameOver = false;
let maxWrongGuesses;

const hangmanPartsDrawing = [
    () => { ctx.beginPath(); ctx.moveTo(12, 228); ctx.lineTo(228, 228); ctx.stroke(); }, // Base
    () => { ctx.beginPath(); ctx.moveTo(60, 228); ctx.lineTo(60, 24); ctx.stroke(); },  // Post
    () => { ctx.beginPath(); ctx.moveTo(60, 24); ctx.lineTo(144, 24); ctx.stroke(); }, // Beam
    () => { ctx.beginPath(); ctx.moveTo(144, 24); ctx.lineTo(144, 48); ctx.stroke(); }, // Rope
    () => { ctx.beginPath(); ctx.arc(144, 66, 18, 0, Math.PI * 2); ctx.stroke(); },   // Head
    () => { ctx.beginPath(); ctx.moveTo(144, 84); ctx.lineTo(144, 144); ctx.stroke(); },// Body
    () => { ctx.beginPath(); ctx.moveTo(144, 96); ctx.lineTo(108, 120); ctx.stroke(); },// Left Arm
    () => { ctx.beginPath(); ctx.moveTo(144, 96); ctx.lineTo(180, 120); ctx.stroke(); },// Right Arm
    () => { ctx.beginPath(); ctx.moveTo(144, 144); ctx.lineTo(108, 180); ctx.stroke(); },// Left Leg
    () => { ctx.beginPath(); ctx.moveTo(144, 144); ctx.lineTo(180, 180); ctx.stroke(); } // Right Leg
];

function drawHangman(numberOfWrongGuessesMade) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#34495e';
  const totalDrawingParts = hangmanPartsDrawing.length;
  let partsToShow = 0;
  if (maxWrongGuesses > 0 && numberOfWrongGuessesMade > 0) {
      partsToShow = Math.ceil((numberOfWrongGuessesMade / maxWrongGuesses) * totalDrawingParts);
  }
  partsToShow = Math.min(partsToShow, totalDrawingParts); // Ensure we don't try to draw more parts than available
  for (let i = 0; i < partsToShow; i++) {
    if (hangmanPartsDrawing[i]) {
      hangmanPartsDrawing[i]();
    }
  }
}

// Updated createKeyboard function for QWERTY layout
function createKeyboard() {
  keyboard.innerHTML = ''; // Clear previous keyboard

  const qwertyLayout = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  qwertyLayout.forEach(rowLetters => {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('keyboard-row');

      rowLetters.forEach(letter => {
          const button = document.createElement('button');
          // button.textContent = letter; // Display lowercase
          button.textContent = letter.toUpperCase(); // Display uppercase on keys
          button.setAttribute('data-letter', letter.toLowerCase()); // Keep data-letter lowercase for logic
          button.addEventListener('click', () => handleGuess(letter.toLowerCase(), button));
          rowDiv.appendChild(button);
      });
      keyboard.appendChild(rowDiv);
  });
}


function displayWord() {
  wordDisplay.textContent = secretWord
    .split('')
    .map(letter => (correctLetters.includes(letter) ? letter.toUpperCase() : '_'))
    .join(' ');
  if (secretWord.length > 0 && secretWord.split('').every(l => correctLetters.includes(l))) {
      if(!gameOver) endGame(true);
  }
}

function handleGuess(letter, button) {
  if (gameOver || button.disabled) return;
  button.disabled = true;
  if (secretWord.includes(letter)) {
    if (!correctLetters.includes(letter)) {
      correctLetters.push(letter);
    }
    displayWord();
  } else {
    if (!wrongLetters.includes(letter)) {
      wrongLetters.push(letter);
      wrongLettersDisplay.textContent = wrongLetters.map(l => l.toUpperCase()).join(', ');
      drawHangman(wrongLetters.length);
      if (wrongLetters.length >= maxWrongGuesses) {
        if(!gameOver) endGame(false);
      }
    }
  }
}

function endGame(won) {
  if (gameOver) return;
  gameOver = true;
  const finalWordDisplay = secretWord.toUpperCase().split('').join(' ');
  if (won) {
    messageDisplay.textContent = `🎉 Congrats, ${playerName}! You won!`;
    wordDisplay.textContent = finalWordDisplay;
  } else {
    drawHangman(maxWrongGuesses); // Ensure full hangman is drawn on loss
    messageDisplay.textContent = `💀 Sorry, ${playerName}. The word was: ${finalWordDisplay}`;
  }
  disableAllKeys();
  playAgainBtn.style.display = 'inline-block';
  saveHistory(won);
}

function disableAllKeys() {
  [...keyboard.children].forEach(row => {
      [...row.children].forEach(button => button.disabled = true);
  });
}

function saveHistory(won) {
  const history = JSON.parse(localStorage.getItem('hangmanHistory')) || [];
  history.push({
    player: playerName,
    word: secretWord.toUpperCase(),
    category: currentCategoryName,
    result: won ? 'Won' : 'Lost',
    date: new Date().toLocaleString(),
    guessesUsed: wrongLetters.length,
    maxGuesses: maxWrongGuesses
  });
  localStorage.setItem('hangmanHistory', JSON.stringify(history));
}

function populateHistory() {
  const history = JSON.parse(localStorage.getItem('hangmanHistory')) || [];
  if (history.length === 0) {
    historyList.innerHTML = '<li>No games played yet.</li>';
    return;
  }
  historyList.innerHTML = '';
  history.slice().reverse().forEach(entry => { // Show newest first
    const li = document.createElement('li');
    let entryText = `${entry.date} — ${entry.player} — Word: "${entry.word}"`;
    if (entry.category) {
      entryText += ` (Category: ${entry.category})`;
    }
    // Add span for result with color
    const resultSpan = document.createElement('span');
    if (entry.result === 'Won') {
      resultSpan.className = 'result-won';
      resultSpan.textContent = 'Won';
    } else {
      resultSpan.className = 'result-lost';
      resultSpan.textContent = 'Lost';
    }
    entryText += ' — Result: ';
    li.textContent = entryText; // Set text before appending span
    li.appendChild(resultSpan); // Append span for result
    if (entry.guessesUsed !== undefined && entry.maxGuesses !== undefined) {
        li.appendChild(document.createTextNode(` (${entry.guessesUsed}/${entry.maxGuesses} wrong guesses)`));
    }
    historyList.appendChild(li);
  });
}

function startGame() {
  const randomCategoryIndex = Math.floor(Math.random() * wordCategories.length);
  const selectedCategoryObject = wordCategories[randomCategoryIndex];
  currentCategoryName = selectedCategoryObject.category;
  const wordsInSelectedCategory = selectedCategoryObject.words;
  secretWord = wordsInSelectedCategory[Math.floor(Math.random() * wordsInSelectedCategory.length)].toLowerCase();

  // Dynamic maxWrongGuesses based on word length, min 4, max 10
  maxWrongGuesses = Math.min(10, Math.max(4, Math.ceil(secretWord.length * 0.6)));

  correctLetters = [];
  wrongLetters = [];
  gameOver = false;
  messageDisplay.textContent = '';
  wrongLettersDisplay.textContent = '';
  guessesInfoDisplay.textContent = `You can make up to ${maxWrongGuesses} wrong guess${maxWrongGuesses === 1 ? '' : 'es'}.`;
  categoryNameDisplay.textContent = currentCategoryName;

  playAgainBtn.style.display = 'none';
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas for new game
  createKeyboard(); // Recreate keyboard with active keys
  displayWord();
}

startBtn.addEventListener('click', () => {
  const name = playerNameInput.value.trim();
  nameErrorMessage.textContent = ''; // Clear previous error
  if (!name) {
    nameErrorMessage.textContent = 'Please enter your name to start or else I am not letting you in.';
    playerNameInput.focus();
    return;
  }
  playerName = name;
  nameScreen.classList.remove('active');
  gameScreen.classList.add('active');
  startGame();
});

playerNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission if it were in a form
      startBtn.click();
  }
});

playAgainBtn.addEventListener('click', () => {
  startGame();
});

showHistoryBtn.addEventListener('click', () => {
  populateHistory();
  historyModal.classList.add('active');
  historyModal.setAttribute('aria-hidden', 'false');
  closeHistoryBtn.focus(); // For accessibility
});

closeHistoryBtn.addEventListener('click', () => {
  historyModal.classList.remove('active');
  historyModal.setAttribute('aria-hidden', 'true');
  showHistoryBtn.focus(); // For accessibility
});

const howToPlayBtn = document.getElementById('how-to-play-btn');
const howToModal = document.getElementById('howto-modal');
const closeHowToBtn = document.getElementById('close-howto');

howToPlayBtn.addEventListener('click', () => {
  howToModal.classList.add('active');
  howToModal.setAttribute('aria-hidden', 'false');
  closeHowToBtn.focus(); // For accessibility
});

closeHowToBtn.addEventListener('click', () => {
  howToModal.classList.remove('active');
  howToModal.setAttribute('aria-hidden', 'true');
  howToPlayBtn.focus(); // For accessibility
});

// Optional: ESC closes How to Play modal
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && howToModal.classList.contains('active')) {
    closeHowToBtn.click();
  }
});

document.addEventListener('keydown', e => {
// ESC closes history modal
if (e.key === 'Escape' && historyModal.classList.contains('active')) {
  closeHistoryBtn.click();
  e.preventDefault(); // Prevent other 'Escape' actions
  return; // Important: Exit after handling modal close
}

// ESC closes how-to modal
if (e.key === 'Escape' && document.getElementById('howto-modal').classList.contains('active')) {
  document.getElementById('close-howto').click();
  e.preventDefault(); // Prevent other 'Escape' actions
  return; // Important: Exit after handling modal close
}

// Ignore shortcuts if input is focused or history modal is open
if (document.activeElement.tagName === "INPUT" || historyModal.classList.contains('active')) return;

// P for Play Again (only if play again button is visible)
if ((e.key === 'p' || e.key === 'P') && playAgainBtn.style.display !== 'none') {
  playAgainBtn.click();
  e.preventDefault();
  return; // Exit after handling
}

// H for History (only if play again button is visible)
if ((e.key === 'h' || e.key === 'H') && playAgainBtn.style.display !== 'none') {
  showHistoryBtn.click();
  e.preventDefault();
  return; // Exit after handling
}

// --- Letter guessing logic ---
// Only allow guessing if game is active and not over
if (!gameScreen.classList.contains('active') || gameOver) return;
if (e.key.length === 1 && e.key.match(/[a-z]/i)) { // Check for single alphabet character
  const letter = e.key.toLowerCase();
  let buttonToClick = null;
  // Find the corresponding button on the virtual keyboard
  const rows = keyboard.getElementsByClassName('keyboard-row');
  for (let row of rows) {
    const buttonsInRow = row.getElementsByTagName('button');
    for (let btn of buttonsInRow) {
      if (btn.getAttribute('data-letter') === letter) {
        buttonToClick = btn;
        break;
      }
    }
    if (buttonToClick) break;
  }

  if (buttonToClick && !buttonToClick.disabled) {
    handleGuess(letter, buttonToClick);
  }
}
});


window.addEventListener('load', () => {
  playerNameInput.focus();
  playAgainBtn.style.display = 'none'; // Initially hide play again
});