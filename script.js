const board = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const result = document.getElementById("result");
const restartButton = document.getElementById("restart");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const undoButton = document.getElementById("undo");
const aiToggleButton = document.getElementById("ai-toggle");
const timerDisplay = document.getElementById("timer");
const resetScoreText = document.getElementById("reset-score");

let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;
let history = [];
let isAIPlaying = false;
let timer;
let scores = { X: 0, O: 0 };

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// Load scores from local storage
window.onload = loadScores;

function handleCellClick(e) {
  const index = e.target.getAttribute("data-index");

  if (gameState[index] !== "" || !isGameActive) return;

  gameState[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  history.push({ index: index, player: currentPlayer });

  checkResult();

  if (isAIPlaying && isGameActive) {
    setTimeout(aiMove, 500);
  }
}

function checkResult() {
  let roundWon = false;

  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      roundWon = true;
      highlightWinningCells(a, b, c);
      // Update the score based on the current player
      if (gameState[a] === "X") {
        scores.X++;
      } else if (gameState[a] === "O") {
        scores.O++;
      }
      break;
    }
  }

  if (roundWon) {
    announceWinner(currentPlayer);
    updateScoreboard();
    isGameActive = false;
    clearInterval(timer);
    return;
  }

  if (!gameState.includes("")) {
    announceWinner("Draw");
    clearInterval(timer);
    return;
  }

  switchPlayer(); // Move to the next player
}

function announceWinner(winner) {
  result.textContent = winner === "Draw" ? "It's a Draw!" : `${winner} Wins! 🎉`;
}

function highlightWinningCells(a, b, c) {
  cells[a].classList.add("win");
  cells[b].classList.add("win");
  cells[c].classList.add("win");
}

function restartGame() {
  gameState = ["", "", "", "", "", "", "", "", ""];
  isGameActive = true;
  currentPlayer = "X";
  result.textContent = "";
  history = [];
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("win");
  });
  clearInterval(timer);
  startTimer();
}

function updateScoreboard() {
  document.getElementById("playerX").textContent = `Player X: ${scores.X}`;
  document.getElementById("playerO").textContent = `Player O: ${scores.O}`;
  localStorage.setItem("ticTacToeScores", JSON.stringify(scores));
}

function loadScores() {
  const storedScores = JSON.parse(localStorage.getItem("ticTacToeScores"));
  if (storedScores) {
    scores = storedScores;
    updateScoreboard();
  }
}

// Dark mode toggle
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Undo last move
function undoLastMove() {
  if (history.length > 0) {
    const lastMove = history.pop();
    gameState[lastMove.index] = "";
    cells[lastMove.index].textContent = "";
    currentPlayer = lastMove.player;
    isGameActive = true;
    result.textContent = "";
  }
}

undoButton.addEventListener("click", undoLastMove);

// AI move
function aiMove() {
  // AI logic to block or win
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    // Check if AI can win
    if (gameState[a] === "O" && gameState[b] === "O" && gameState[c] === "") {
      gameState[c] = "O"; // Win
      cells[c].textContent = "O";
      checkResult();
      return;
    } else if (gameState[b] === "O" && gameState[c] === "O" && gameState[a] === "") {
      gameState[a] = "O"; // Win
      cells[a].textContent = "O";
      checkResult();
      return;
    } else if (gameState[a] === "O" && gameState[c] === "O" && gameState[b] === "") {
      gameState[b] = "O"; // Win
      cells[b].textContent = "O";
      checkResult();
      return;
    }

    // Check if player (X) is about to win and block
    if (gameState[a] === "X" && gameState[b] === "X" && gameState[c] === "") {
      gameState[c] = "O"; // Block
      cells[c].textContent = "O";
      checkResult();
      return;
    } else if (gameState[b] === "X" && gameState[c] === "X" && gameState[a] === "") {
      gameState[a] = "O"; // Block
      cells[a].textContent = "O";
      checkResult();
      return;
    } else if (gameState[a] === "X" && gameState[c] === "X" && gameState[b] === "") {
      gameState[b] = "O"; // Block
      cells[b].textContent = "O";
      checkResult();
      return;
    }
  }

  // If no winning or blocking move, pick a random empty cell
  let emptyCells = gameState.map((val, idx) => (val === "" ? idx : null)).filter((idx) => idx !== null);
  let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  gameState[randomCell] = "O";
  cells[randomCell].textContent = "O";
  checkResult();
}

aiToggleButton.addEventListener("click", () => {
  isAIPlaying = !isAIPlaying;
  aiToggleButton.textContent = isAIPlaying ? "Stop Playing AI" : "Play Against AI";
  if (!isAIPlaying) {
    restartGame(); // Restart game when toggling off AI
  }
});

// Timer for each move
function startTimer() {
  let timeLeft = 10;
  timerDisplay.textContent = `Time Left: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      if (currentPlayer === "X") {
        currentPlayer = "O"; // AI's turn
        aiMove(); // Trigger AI move
      } else {
        currentPlayer = "X"; // Reset back to X after AI's turn
        switchPlayer(); // Allow player to play again
      }
    }
  }, 1000);
}

function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X"; // Switch between players
}

// Reset scores
resetScoreText.addEventListener("click", () => {
  scores = { X: 0, O: 0 }; // Reset scores
  updateScoreboard(); // Update scoreboard display
});

// Event Listeners
cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
restartButton.addEventListener("click", restartGame);

startTimer(); // Start timer when the page loads
