const board = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const result = document.getElementById("result");
const resetButton = document.getElementById("reset");
const darkModeToggle = document.getElementById("dark-mode-toggle");
const undoButton = document.getElementById("undo");
const aiToggleButton = document.getElementById("ai-toggle");
const resetScoreText = document.getElementById("reset-score");

let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;
let history = [];
let isAIPlaying = false;
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
    return;
  }

  if (!gameState.includes("")) {
    announceWinner("Draw");
    return;
  }

  switchPlayer();
}

function announceWinner(winner) {
  result.textContent = winner === "Draw" ? "It's a Draw!" : `${winner} Wins! 🎉`;
}

function highlightWinningCells(a, b, c) {
  cells[a].classList.add("win");
  cells[b].classList.add("win");
  cells[c].classList.add("win");
}

function resetGame() {
  gameState = ["", "", "", "", "", "", "", "", ""];
  isGameActive = true;
  currentPlayer = "X";
  result.textContent = "";
  history = [];
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("win");
  });
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

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

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

function aiMove() {
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gameState[a] === "O" && gameState[b] === "O" && gameState[c] === "") {
      gameState[c] = "O";
      cells[c].textContent = "O";
      checkResult();
      return;
    } else if (gameState[b] === "O" && gameState[c] === "O" && gameState[a] === "") {
      gameState[a] = "O";
      cells[a].textContent = "O";
      checkResult();
      return;
    } else if (gameState[a] === "O" && gameState[c] === "O" && gameState[b] === "") {
      gameState[b] = "O";
      cells[b].textContent = "O";
      checkResult();
      return;
    }

    if (gameState[a] === "X" && gameState[b] === "X" && gameState[c] === "") {
      gameState[c] = "O";
      cells[c].textContent = "O";
      checkResult();
      return;
    } else if (gameState[b] === "X" && gameState[c] === "X" && gameState[a] === "") {
      gameState[a] = "O";
      cells[a].textContent = "O";
      checkResult();
      return;
    } else if (gameState[a] === "X" && gameState[c] === "X" && gameState[b] === "") {
      gameState[b] = "O";
      cells[b].textContent = "O";
      checkResult();
      return;
    }
  }

  let emptyCells = gameState.map((val, idx) => (val === "" ? idx : null)).filter((idx) => idx !== null);
  let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  gameState[randomCell] = "O";
  cells[randomCell].textContent = "O";
  checkResult();
}

aiToggleButton.addEventListener("click", () => {
  isAIPlaying = !isAIPlaying;
  aiToggleButton.textContent = isAIPlaying ? "Stop Playing AI" : "Play Against AI";
  if (!isAIPlaying || isAIPlaying) {
    resetGame();
  }
});

function switchPlayer() {
  currentPlayer = currentPlayer === "O" ? "X" : "O";
}

resetScoreText.addEventListener("click", () => {
  scores = { X: 0, O: 0 };
  updateScoreboard();
});

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetButton.addEventListener("click", resetGame);

function trainAI(iterations = 1000000) {
  for (let i = 0; i < iterations; i++) {
    resetGame();
    let prevState, prevAction;

    while (isGameActive) {
      const state = gameState.join("");
      const action = chooseAction(state);
      prevState = state;
      prevAction = action;
      gameState[action] = currentPlayer;
      const reward = checkTrainingResult();
      const nextState = gameState.join("");
      updateQValue(prevState, prevAction, reward, nextState);
      currentPlayer = currentPlayer === "X" ? "O" : "X";
    }
  }
  localStorage.setItem("ticTacToeQValues", JSON.stringify(Q));
}

function checkTrainingResult() {
  let roundWon = false;

  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      roundWon = true;
      isGameActive = false;
      return currentPlayer === "O" ? 1 : -1;
    }
  }

  if (!gameState.includes("")) {
    isGameActive = false;
    return 0.5;
  }

  return 0;
}

function loadQValues() {
  const storedQValues = JSON.parse(localStorage.getItem("ticTacToeQValues"));
  if (storedQValues) {
    Q = storedQValues;
  }
}

window.onload = () => {
  loadScores();
  loadQValues();
  trainAI();
};
