const speed = 500;  // Lower value means faster animation, adjust as needed

function displayBoard(board) {
    const container = document.getElementById('puzzle-container');
    container.innerHTML = '';  // Clear previous board
    board.forEach(row => {
        row.forEach(cell => {
            const cellDiv = document.createElement('div');
            cellDiv.textContent = cell !== 0 ? cell : '';
            cellDiv.className = cell === 0 ? 'empty' : '';
            container.appendChild(cellDiv);
        });
    });
}

function solvePuzzle() {
    const board = getBoard();
    displayBoard(board);

    fetch('/solve', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ board })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No solution found');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            displayMessage('No solution found.');
            animateNoSolution(board);
            return;
        }
        displayMessage('Solution found!', () => {
            displayMessage('Steps: ' + data.steps, () => {
                displayMessage('Time: ' + data.timeTaken.toFixed(2) + ' seconds');
            });
        });
        animateSolution(data.moves);
    })
    .catch(error => {
        console.error('Error:', error);
        displayMessage('Error solving the puzzle.');
        animateNoSolution(board);
    });
}

function shufflePuzzle() {
    fetch('/shuffle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        displayBoard(data.board);
    })
    .catch(error => {
        console.error('Error:', error);
        displayMessage('Error shuffling the puzzle.');
    });
}

function animateSolution(moves) {
    moves.forEach((move, index) => {
        setTimeout(() => displayBoard(move[1]), speed * index);  // Adjust speed here
    });
}

function animateNoSolution(state) {
    for (let i = 0; i < 5; i++) {  // Flashes the last state five times
        setTimeout(() => {
            displayBoard(state);  // Show the state
            setTimeout(() => {
                const container = document.getElementById('puzzle-container');
                container.innerHTML = '';  // Clear the board
            }, speed / 2);  // Short display time
        }, speed * 3 * i);  // Adjust speed here
    }
}

function displayMessage(message, callback) {
    const container = document.getElementById('message-container');
    container.innerHTML = '';  // Clear previous messages
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.textContent = message;
    container.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.opacity = 1;
        setTimeout(() => {
            messageDiv.style.opacity = 0;
            setTimeout(() => {
                container.removeChild(messageDiv);
                if (callback) {
                    callback();
                }
            }, 1000);  // Time for the message to fade out
        }, 1000);  // Time for the message to be fully visible
    }, 100);  // Time for the message to fade in
}

function getBoard() {
    const container = document.getElementById('puzzle-container');
    const board = [];
    let row = [];
    container.childNodes.forEach((cell, index) => {
        row.push(cell.textContent === '' ? 0 : parseInt(cell.textContent));
        if ((index + 1) % 3 === 0) {
            board.push(row);
            row = [];
        }
    });
    return board;
}

// Initial display (could be a shuffled board or a static example)
displayBoard([
    [4, 3, 7],
    [5, 8, 2],
    [6, 1, 0]
]);

