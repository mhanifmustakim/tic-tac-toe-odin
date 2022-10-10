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
    let players = [Player("Nips", "X"), Player("Spin", "O")];
    let currentPlayer = players[0];

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
    }

    const gameOver = () => {
        document.querySelectorAll("#gameBoard>div").forEach((cell) => cell.removeEventListener("click", GameBoard.onClick));
    }

    const win = () => {
        console.log(currentPlayer.sign, "won!");
        gameOver();
    }

    const draw = () => {
        console.log("It's a draw!");
        gameOver();
    }

    return {
        start,
        win,
        draw,
        nextPlayer,
        getCurrentPlayer
    }
})();

Game.start();