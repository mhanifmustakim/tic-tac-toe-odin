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

        update(pos, Game.getCurrentPlayer());
        cell.removeEventListener("click", onClick);
    }

    const update = ({ row, col }, { sign }) => {
        board[row][col] = sign;
        Game.nextPlayer();
        render();
    }

    const render = () => {
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                const cell = document.querySelector(`div[data-row="${row}"][data-col="${col}"]`);
                cell.innerText = board[row][col];
            }
        }
    }

    return {
        init,
        render,
        onClick
    }
})();

// Factory Function for creating a new player
const Player = function (name, sign) {
    return {
        name,
        sign
    }
}

// Handles every game continuation logic
const Game = (function () {
    let board = GameBoard.init();
    let players = [Player("Nips", "X"), Player("Spin", "O")];
    let currentPlayer = players[0];

    const getCurrentPlayer = () => {
        return currentPlayer;
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

    return {
        start,
        getCurrentPlayer,
        nextPlayer
    }
})();

Game.start();