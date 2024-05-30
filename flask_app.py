from flask import Flask, jsonify, request, send_from_directory
import time
from puzzle_solver import Solver, Puzzle, Node  # Ensure this imports correctly from your eight_puzzle.py file

app = Flask(__name__, static_folder='static')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/solve', methods=['POST'])
def solve_puzzle():
    data = request.get_json()
    board = data['board']
    goal = data.get('goal', [1, 2, 3, 4, 5, 6, 7, 8, 0])  # Default goal state, modify as necessary
    puzzle = Puzzle(board)
    solver = Solver(puzzle, goal)
    start_time = time.time()
    path = solver.solve()

    if path is None:
        return jsonify({"error": "No solution found"}), 404

    try:
        moves = []
        for node in path:
            if isinstance(node, Node):
                moves.append((node.action, node.puzzle.board))
            else:
                print(f"Unexpected element in path: {node}")
                return jsonify({"error": "Invalid path element"}), 500
    except AttributeError as e:
        print(f"Error processing path elements: {str(e)}")
        return jsonify({"error": "Error processing path elements"}), 500

    return jsonify({
        "moves": moves,
        "timeTaken": time.time() - start_time,
        "steps": len(moves)
    })

@app.route('/shuffle', methods=['POST'])
def shuffle_puzzle():
    board = [[1, 2, 3], [4, 5, 0], [6, 7, 8]]
    puzzle = Puzzle(board)
    shuffled_puzzle = puzzle.shuffle()
    return jsonify({"board": shuffled_puzzle.board})

if __name__ == "__main__":
    app.run(debug=True)

