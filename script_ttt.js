document.addEventListener("DOMContentLoaded", () => {
    const cells = document.querySelectorAll(".cell");
    const statusDisplay = document.getElementById("status");
    const restartButton = document.getElementById("restart");
    const difficultySelect = document.getElementById("difficulty");

    let currentPlayer = "X";
    let gameActive = true;
    let board = ["", "", "", "", "", "", "", "", ""];
    let gameMode = "human"; // Standard: Mensch gegen Mensch

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

    // Anzeigen, welcher Spieler dran ist
    const updateStatus = () => {
        if (gameActive) {
            statusDisplay.textContent = `Spieler ${currentPlayer} ist dran`;
        }
    };

    // Wechsel zwischen den Spielern
    const switchPlayer = () => {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateStatus();
    };

    // Prüfen, ob ein Spieler gewonnen hat
    const checkWinner = () => {
        let roundWon = false;
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            statusDisplay.textContent = `Spieler ${currentPlayer} hat gewonnen!`;
            gameActive = false;
        } else if (!board.includes("")) {
            statusDisplay.textContent = "Unentschieden!";
            gameActive = false;
        } else {
            switchPlayer();
        }
    };

    // Setzen eines Zuges auf dem Spielfeld
    const handleCellClick = (e) => {
        const cell = e.target;
        const cellIndex = cell.getAttribute("data-index");

        if (board[cellIndex] !== "" || !gameActive) {
            return;
        }

        board[cellIndex] = currentPlayer;
        cell.textContent = currentPlayer;
        checkWinner();

        if (gameActive && currentPlayer === "O" && gameMode !== "human") {
            if (gameMode === "easy") {
                easyAIMove();
            } else if (gameMode === "hard") {
                hardAIMove();
            }
        }
    };

    // Einfache KI, die zufällig setzt
    const easyAIMove = () => {
        let availableCells = board
            .map((cell, index) => (cell === "" ? index : null))
            .filter(index => index !== null);

        let randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
        board[randomCell] = "O";
        cells[randomCell].textContent = "O";
        checkWinner();
    };

    // Schwierige KI mit Minimax-Algorithmus (optional)
    const hardAIMove = () => {
        let bestScore = -Infinity;
        let bestMove;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, 0, false);
                board[i] = "";
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        board[bestMove] = "O";
        cells[bestMove].textContent = "O";
        checkWinner();
    };

    const minimax = (newBoard, depth, isMaximizing) => {
        let scores = {
            X: -10,
            O: 10,
            tie: 0
        };

        let winner = checkWinnerMinimax(newBoard);
        if (winner !== null) {
            return scores[winner];
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < newBoard.length; i++) {
                if (newBoard[i] === "") {
                    newBoard[i] = "O";
                    let score = minimax(newBoard, depth + 1, false);
                    newBoard[i] = "";
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < newBoard.length; i++) {
                if (newBoard[i] === "") {
                    newBoard[i] = "X";
                    let score = minimax(newBoard, depth + 1, true);
                    newBoard[i] = "";
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const checkWinnerMinimax = (board) => {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return board.includes("") ? null : "tie";
    };

    // Schwierigkeitsgrad auswählen
    difficultySelect.addEventListener("change", (e) => {
        gameMode = e.target.value;
        restartGame(); // Spiel neu starten bei Schwierigkeitsänderung
    });

    // Neustart des Spiels
    const restartGame = () => {
        board = ["", "", "", "", "", "", "", "", ""];
        cells.forEach(cell => (cell.textContent = ""));
        gameActive = true;
        currentPlayer = "X";
        updateStatus();
    };

    cells.forEach(cell => cell.addEventListener("click", handleCellClick));
    restartButton.addEventListener("click", restartGame);

    updateStatus();
});
