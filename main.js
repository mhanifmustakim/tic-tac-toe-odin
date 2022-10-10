// Handles all logic inside the tic-tac-toe board
const GameBoard = (function () {
    let board;

    const init = () => {
        board = Array(3).fill(null).map((el) => (Array(3).fill(null)));
        return board
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
        board[row][col] = sign;
        render();
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

    const checkEndCondition = () => {
        if (checkWinRows() || checkWinCols() || checkWinDiagonals()) {
            Game.win();
        } else if (checkDraw()) {
            Game.draw();
        }
    }

    const render = () => {
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                const cell = document.querySelector(`div[data-row="${row}"][data-col="${col}"]`);
                cell.innerText = board[row][col];
            }
        }
        checkEndCondition();
    }

    return {
        init,
        onClick,
        update
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
        makeMove
    }
}

// Handles every game continuation logic
const Game = (function () {
    let board = GameBoard.init();
    let players, currentPlayer;

    const setPlayers = (p1, p2) => {
        players = [p1, p2];
        currentPlayer = players[0];
    }

    const getCurrentPlayer = () => {
        return currentPlayer
    }

    const nextPlayer = () => {
        currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }

    const start = () => {
        const gameBoardEl = document.querySelector("#gameBoard");
        gameBoardEl.innerHTML = "";

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
    }

    const gameOver = () => {
        document.querySelectorAll("#gameBoard>div").forEach((cell) => cell.removeEventListener("click", GameBoard.onClick));
    }

    const win = () => {
        GameLog.setLog(`Congratulations, ${currentPlayer.name} won!`);
        gameOver();
    }

    const draw = () => {
        GameLog.setLog(`Great game, it's a draw!`);
        gameOver();
    }

    return {
        start,
        win,
        draw,
        setPlayers,
        nextPlayer,
        getCurrentPlayer
    }
})();

// Handles gameLogging, displaying logs to the web page
const GameLog = (function () {
    const player1Log = document.querySelector("#player1");
    const player2Log = document.querySelector("#player2");
    const mainLog = document.querySelector("#gameLog-bottom");

    const setLog = (str) => {
        mainLog.innerText = str;
    }

    const setPlayers = ([player1, player2]) => {
        player1Log.innerText = `${player1.name} ==> ${player1.sign}`;
        player2Log.innerText = `${player2.sign} <== ${player2.name}`;
    }

    return {
        setLog,
        setPlayers
    }
})();

const FormControl = (function () {
    form = document.querySelector("#player-form");

    const getPlayer1 = () => {
        const nameInput = form.querySelector("#p1-name");
        const signInput = form.querySelector("#p1-sign");
        const name = nameInput.value || nameInput.placeholder;
        const sign = signInput.value || signInput.placeholder;
        return Player(name, sign)
    }

    const getPlayer2 = () => {
        const nameInput = form.querySelector("#p2-name");
        const signInput = form.querySelector("#p2-sign");
        const name = nameInput.value || nameInput.placeholder;
        const sign = signInput.value || signInput.placeholder;

        return Player(name, sign)
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
        formSubmit
    }
})();

document.querySelector("#player-form").addEventListener("submit", FormControl.formSubmit);