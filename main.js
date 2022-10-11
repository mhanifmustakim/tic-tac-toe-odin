// board Factory function to create an instance of board
const Board = () => {
    let board;
    let winner = null;
    let lastUpdate = null;

    const init = () => {
        winner = null;
        lastUpdate = null;
        board = Array(3).fill(null).map((el) => (Array(3).fill(null)));
        return board
    }

    const getBoard = () => {
        return board
    }

    const setBoard = (newBoard) => {
        board = [];
        winner = null;
        lastUpdate = null;

        for (let i = 0; i < newBoard.length; i++) {
            board[i] = newBoard[i].slice();
        }
    }

    const getEmptyCells = () => {
        const availableCells = [];
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                if (!board[row][col]) availableCells.push({ row, col });
            }
        }

        return availableCells;
    }

    const getWinner = () => {
        return winner
    }

    const update = ({ row, col }, sign) => {
        board[row][col] = sign;
        lastUpdate = sign;
    }

    const checkSimilar = (arr) => {
        const first = arr[0];
        if (first) {
            return arr.every((val) => val === first);
        }
    }

    const checkWinRows = () => {
        const results = [];
        for (let row = 0; row < board.length; row++) {
            results.push(checkSimilar(board[row]));
        }
        return results.some((val) => val === true);
    }

    const checkWinCols = () => {
        const results = [];
        for (let col = 0; col < board[0].length; col++) {
            const column = [];
            for (let row = 0; row < board.length; row++) {
                column.push(board[row][col]);
            }
            results.push(checkSimilar(column));
        }
        return results.some((val) => val === true);
    }

    const checkWinDiagonals = () => {
        let diag1 = [];
        let diag2 = [];
        for (let i = 0; i < board.length; i++) {
            diag1.push(board[i][i]);
            diag2.push(board[i][board.length - 1 - i]);
        }

        return checkSimilar(diag1) || checkSimilar(diag2);
    }

    const checkDraw = () => {
        for (let row = 0; row < board.length; row++) {
            if (board[row].some((val) => val === null)) return false
        }

        return true;
    }

    const checkWin = () => {
        if (checkWinRows() || checkWinCols() || checkWinDiagonals()) {
            winner = Game.getCurrentPlayer().sign === lastUpdate ?
                Game.getCurrentPlayer() : Game.getNextPlayer();
            return true
        }

        return false

    }

    return {
        init,
        getBoard,
        setBoard,
        getWinner,
        getEmptyCells,
        update,
        checkWin,
        checkDraw
    }
}

// Handles all logic inside the tic-tac-toe board
const GameBoard = (function () {
    let board = Board();

    const init = () => {
        return board.init();
    }

    const getBoard = () => {
        return board.getBoard();
    }

    const getEmptyCells = () => {
        return board.getEmptyCells();
    }

    const onClick = (event) => {
        const cell = event.target;
        // Checks if cell is already populated
        if (cell.innerText) {
            cell.removeEventListener("click", onClick);
            return
        }

        const pos = {
            row: parseInt(event.target.getAttribute("data-row")),
            col: parseInt(event.target.getAttribute("data-col"))
        }

        Game.getCurrentPlayer().makeMove(pos);
        cell.removeEventListener("click", onClick);
    }

    const update = ({ row, col }, sign) => {
        board.update({ row, col }, sign)
        render();
    }

    const checkEndCondition = () => {
        if (board.checkWin()) {
            Game.win();
        } else if (board.checkDraw()) {
            Game.draw();
        }
    }

    const render = () => {
        let gameBoard = board.getBoard();
        for (let row = 0; row < gameBoard.length; row++) {
            for (let col = 0; col < gameBoard[row].length; col++) {
                const cell = document.querySelector(`div[data-row="${row}"][data-col="${col}"]`);
                cell.innerText = gameBoard[row][col];
            }
        }
        checkEndCondition();
    }

    return {
        init,
        onClick,
        update,
        getBoard,
        getEmptyCells
    }
})();

// Factory Function for creating a new player
const Player = function (name, sign) {
    const makeMove = (pos) => {
        GameBoard.update(pos, sign);
        Game.nextPlayer();
    }

    return {
        name,
        sign,
        makeMove,
        type: "player"
    }
}

//Factory function for creating a computer
const Computer = function (sign) {
    const makeMove = () => {
        // const availableCells = GameBoard.getEmptyCells();
        // const randomPos = availableCells[Math.floor(Math.random() * availableCells.length)];
        // GameBoard.update(randomPos, sign);
        const board = Board();
        board.setBoard(GameBoard.getBoard());

        GameBoard.update(minimax(board, true).bestMove, sign);
        Game.nextPlayer();
    }

    const minimax = (board, isMaximizing) => {
        if (board.checkWin()) {
            return {
                score: board.getWinner().sign === sign ? 1 : -1
            }
        } else if (board.checkDraw()) {
            return { score: 0 };
        }

        const availableCells = board.getEmptyCells();
        let bestMove, bestScore;
        if (isMaximizing === true) {
            let score = -Infinity;
            for (let cell of availableCells) {
                const tempBoard = Board();
                tempBoard.setBoard(board.getBoard());
                tempBoard.update(cell, sign);
                score = Math.max(score, minimax(tempBoard, false).score);
                if (bestScore !== score) {
                    bestScore = score;
                    bestMove = cell;
                    if (bestScore === 1) break;
                }
            }
            return { score, bestMove }
        } else {
            let score = Infinity;
            for (let cell of availableCells) {
                const tempBoard = Board();
                tempBoard.setBoard(board.getBoard());
                tempBoard.update(cell, Game.getNextPlayer().sign);
                score = Math.min(score, minimax(tempBoard, true).score);
                if (bestScore !== score) {
                    bestScore = score;
                    bestMove = cell;
                    if (bestScore === -1) break;
                }
            }
            return { score, bestMove }
        }
    }

    return {
        sign,
        makeMove,
        name: "Computer",
        type: "Computer",
    }
}

// Handles every game continuation logic
const Game = (function () {
    let board = GameBoard.init();
    let isGameOver;
    let players, currentPlayer;

    const setPlayers = (p1, p2) => {
        players = [p1, p2];
        currentPlayer = players[0];
    }

    const getCurrentPlayer = () => {
        return currentPlayer
    }

    const getNextPlayer = () => {
        return currentPlayer === players[0] ? players[1] : players[0];
    }

    const nextPlayer = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
        if (isGameOver) return
        GameLog.setLog(`${currentPlayer.name}'s (${currentPlayer.sign}) turn to move`)
        if (currentPlayer.type === "Computer") currentPlayer.makeMove();
    }

    const start = () => {
        const gameBoardEl = document.querySelector("#gameBoard");
        gameBoardEl.innerHTML = "";
        board = GameBoard.init();
        isGameOver = false;

        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                const cell = document.createElement("div");
                cell.addEventListener("click", GameBoard.onClick);
                cell.setAttribute("data-row", row);
                cell.setAttribute("data-col", col);
                gameBoardEl.appendChild(cell);
            }
        }

        GameLog.setPlayers(players);
        GameLog.setLog(`${currentPlayer.name}'s (${currentPlayer.sign}) turn to move`)
        if (currentPlayer.type === "Computer") currentPlayer.makeMove();
    }

    const gameOver = () => {
        document.querySelectorAll("#gameBoard>div").forEach((cell) => cell.removeEventListener("click", GameBoard.onClick));
        isGameOver = true;
    }

    const reset = () => {
        GameLog.reset();
        start();
    }

    const win = () => {
        GameLog.setLog(`Congratulations, ${currentPlayer.name} (${currentPlayer.sign}) won!`);
        GameLog.toggleControls();
        gameOver();
    }

    const draw = () => {
        GameLog.setLog(`Great game, it's a draw!`);
        GameLog.toggleControls();
        gameOver();
    }

    return {
        start,
        reset,
        win,
        draw,
        setPlayers,
        nextPlayer,
        getCurrentPlayer,
        getNextPlayer
    }
})();

// Handles gameLogging, displaying logs to the web page
const GameLog = (function () {
    const player1Log = document.querySelector("#player1");
    const player2Log = document.querySelector("#player2");
    const mainLog = document.querySelector("#main-log");
    const gameControls = document.querySelector("#game-controls");

    const setLog = (str) => {
        mainLog.innerText = str;
    }

    const toggleControls = () => {
        gameControls.classList.toggle("display-none");
    }

    const initControls = () => {
        const resetBtn = document.querySelector("#reset-btn");
        const playerResetBtn = document.querySelector("#player-reset-btn");

        resetBtn.addEventListener("click", Game.reset);
        playerResetBtn.addEventListener("click", hardReset);
    }

    const reset = () => {
        setLog("");
        toggleControls();
    }

    const hardReset = () => {
        player1Log.innerText = "";
        player2Log.innerText = "";
        FormControl.toggleDisplay();

        reset();
    }

    const setPlayers = ([player1, player2]) => {
        player1Log.innerText = `${player1.name} ==> ${player1.sign}`;
        player2Log.innerText = `${player2.sign} <== ${player2.name}`;
    }

    return {
        setLog,
        setPlayers,
        toggleControls,
        initControls,
        reset
    }
})();

const FormControl = (function () {
    form = document.querySelector("#player-form");

    const clearForm = (input) => {
        input.value = ""
    }

    const getPlayer1 = () => {
        const nameInput = form.querySelector("#p1-name");
        const isComp = form.querySelector("#p1-isComputer");

        if (isComp.checked) {
            return Computer("X");
        }

        const name = nameInput.value || nameInput.placeholder;
        clearForm(nameInput);

        return Player(name, "X")
    }

    const getPlayer2 = () => {
        const nameInput = form.querySelector("#p2-name");
        const isComp = form.querySelector("#p2-isComputer");

        if (isComp.checked) {
            return Computer("O");
        }

        const name = nameInput.value || nameInput.placeholder;
        clearForm(nameInput);

        return Player(name, "O")
    }

    const toggleDisplay = () => {
        form.classList.toggle("display-none");
        document.querySelector("#gameBoard").classList.toggle("display-none");
        const VS = document.querySelector("#player1").nextElementSibling;
        VS.hidden = VS.hidden ? false : true;
    }

    const formSubmit = (event) => {
        event.preventDefault();
        Game.setPlayers(getPlayer1(), getPlayer2());
        toggleDisplay();
        Game.start();
    }

    return {
        formSubmit,
        toggleDisplay
    }
})();

document.querySelector("#player-form").addEventListener("submit", FormControl.formSubmit);
GameLog.initControls();