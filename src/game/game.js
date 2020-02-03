import React from 'react';
import './game.css';
import db from '../db.js';
import PlayBoard from './board/play-board';
import HistoryBoard from './board/history-board';

/**
 * Main component for the game
 */
class Game extends React.Component {
  constructor(props) {
    super(props);
    if (localStorage.getItem('gameId') === null) {
      localStorage.setItem('gameId', 1)
    }
    if (localStorage.getItem('isAscending') === null) {
      localStorage.setItem('isAscending', true)
    }
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        lastPlay: null
      }],
      stepNumber: 0,
      xIsNext: true,
      games: [],
      gameId: localStorage.getItem('gameId'),
      historySteps: Array(9).fill(0),
      isAscending: JSON.parse(localStorage.getItem('isAscending'))
    };
  }

  /**
   * Retrieve previous games played from IndexedDB
   */
  componentDidMount() {
    db.table('games')
      .toArray()
      .then((games) => {
        this.setState({ games });
        let aux = [];
        for (let i of games)
          aux.push(i.history.length - 1)
        this.setState({
          historySteps: aux
        })
      });
  }

  /**
   * Handles the user click on each square and fills them accordingly
   * @param {*} i - Index that uniquely identifies each square of the board
   */
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).symbol || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        lastPlay: i
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  /**
   * Handles arrow key events related to browsing saved games' steps
   * @param {*} e - Event object
   * @param {*} gameId - ID that uniquely identifies the game to be browsed through
   */
  handleHistoryKeyDown(e, gameId) {
    if (e.keyCode === 37) {
      this.historyJumpTo(gameId, -1)
    } else if (e.keyCode === 39) {
      this.historyJumpTo(gameId, 1)
    }
  }

  /**
   * Handles arrow key events related to browsing the list of moves of current game
   * @param {*} e - Event object
   */
  handleMovesKeyDown(e) {
    e.preventDefault();

    let cond1 = this.state.isAscending ? 40 : 38;
    let cond2 = this.state.isAscending ? 38 : 40;

    if (e.keyCode === cond1) {
      if (this.state.stepNumber >= 0 && this.state.stepNumber < this.state.history.length - 1)
        this.jumpTo(this.state.stepNumber + 1)
    } else if (e.keyCode === cond2) {
      if (this.state.stepNumber > 0 && this.state.stepNumber <= this.state.history.length - 1)
        this.jumpTo(this.state.stepNumber - 1)
    }
  }

  /**
   * Allows the user to go to the chosen step of the game
   * @param {*} step - Step of the game
   */
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  /**
   * Allows the user to browse all the steps of the chosen game
   * @param {number} id - ID that uniquely identifies the game
   * @param {number} step - Identifier of which step should be browsed
   */
  historyJumpTo(id, step) {
    const games = this.state.games.slice();
    const currentSteps = this.state.historySteps.slice();
    const currStep = currentSteps[id];
    const length = games[id].history.length;
    let current, nextStep;
    if (step === 0) {
      nextStep = step;
      current = games[id].history[nextStep];
      currentSteps[id] = nextStep;
    } else if (step === 1) {
      nextStep = (currStep >= 0 && currStep < length - 1) ? currentSteps[id] + 1 : currentSteps[id];
    } else if (step === -1) {
      nextStep = (currStep > 0 && currStep <= length - 1) ? currentSteps[id] - 1 : currentSteps[id];
    }
    current = games[id].history[nextStep];
    currentSteps[id] = nextStep;
    games[id].current = current;
    this.setState({
      historySteps: currentSteps
    })
    this.setState({
      games: games
    })
  }

  /**
   * Adds a game to IndexedDB once it is finished and submitted and increments the game ID
   */
  finishGame() {
    const current = this.state.history[this.state.history.length - 1];
    const winner = calculateWinner(current.squares);

    if (!(winner.symbol || winner.isDraw)) {
      return;
    }

    const game = {
      current: this.state.history[this.state.stepNumber],
      history: this.state.history,
      gameId: Number(this.state.gameId),
      winner: winner.symbol,
      isDraw: winner.isDraw,
      winLine: winner.line
    }

    db.table('games')
      .put(game)
      .then((gameId) => {
        const newList = [...this.state.games, Object.assign({}, game, { gameId })];
        this.setState({ games: newList });
      });

    localStorage.setItem('gameId', Number(this.state.gameId) + 1);
    this.resetGame();
  }

  /**
   * Resets the board, clearing all squares from any input previously given by the user
   */
  resetGame() {
    this.setState({
      history: [{
        squares: Array(9).fill(null),
        lastPlay: null
      }],
      stepNumber: 0,
      xIsNext: true,
      gameId: localStorage.getItem('gameId')
    });
  }

  /**
   * Reverts the order of the items on the list of moves
   */
  revertOrder() {
    const ascending = !this.state.isAscending;
    this.setState({
      isAscending: ascending
    })
    localStorage.setItem('isAscending', ascending);
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const isAscending = this.state.isAscending;

    const moves = history.map((step, move) => {
      const lastPlay = step.lastPlay;
      const col = (lastPlay % 3) + 1;
      const row = Math.floor(lastPlay / 3) + 1;

      const desc = move ?
        'Go to move #' + move + " (" + col + "," + row + ")" :
        'Go to game start';
      return (
        <div key={move} className={`move-item bg-555 mb-1 br-radius-5 ${this.state.stepNumber === move ? 'bg-333' : ''}`}>
          <div
            tabIndex="0"
            className={`pl-3 p-1 ${this.state.stepNumber === move ? 'avenir-black' : ''}`}
            onClick={() => this.jumpTo(move)}>{desc}
          </div>
        </div>
      )
    })

    if (!isAscending) {
      moves.reverse()
    }

    let status, submit, reset, winLine, statusColor;
    winLine = [];
    statusColor = "bg-666";
    if (winner.symbol) {
      status = 'Winner: ' + winner.symbol;
      statusColor = 'bg-success';
      submit = <button className="btn btn-success w-100" onClick={() => this.finishGame()}>Submit</button>
      winLine = winner.line;

    } else if (winner.isDraw) {
      status = 'Draw';
      statusColor = 'bg-warning';
      submit = <button className="btn btn-success w-100" onClick={() => this.finishGame()}>Submit</button>
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    reset = <button className="btn btn-primary w-100" onClick={() => this.resetGame()}>Start Over</button>

    return (
      <div>
        <div className="game row mx-0">
          <div className="game-board col-12">
            <div className="game-info">
              <h1 className="text-center">Tic Tac Toe</h1>
            </div>
            <div className="card mx-auto my-2">
              <div className="card-header bg-777">
                <div className={`p-2 br-radius-5 ${statusColor}`}>
                  <div className='text-center'>{status}</div>
                </div>
              </div>
              <div className="card-footer row bg-444">
                <div className="col-12 col-md-6 my-1">
                  <PlayBoard
                    squares={current.squares}
                    winner={winLine}
                    onClick={(i) => this.handleClick(i)}
                    submit={submit}
                    reset={reset}
                  />
                </div>
                <div className="col-12 col-md-6 bg-666 br-radius-5 my-1 p-2" onKeyDown={(e) => this.handleMovesKeyDown(e)}>
                  <div className="game-info">
                    <div className="pl-3 pb-2 avenir-black">Moves:</div>
                    <div className="moves-container">{moves}</div>
                    <div className="text-center">
                      <button
                        className={`order-btn bg-444 ${isAscending ? 'gradient-up' : 'gradient-down'}`}
                        onClick={() => this.revertOrder()}>{isAscending ? '⇅' : '⇵'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {
              this.state.games.length > 0 &&
              <div className="card mx-auto my-2 bg-444">
                <div className="row p-2">
                  {
                    this.state.games.length > 0 &&
                    this.state.games.map((games, gameId) => {
                      return (
                        <div key={games.gameId} className="p-2 text-center" onKeyDown={(e) => this.handleHistoryKeyDown(e, gameId)}>
                          <div>Game #{games.gameId}</div>
                          <HistoryBoard
                            winner={games.winLine}
                            squares={games.current.squares}
                          />
                          <div className="row history-row">
                            <div className="col-4 p-0 history-btn-container" tabIndex="0">
                              <div className="history-btn" onClick={() => this.historyJumpTo(gameId, 0)}>●</div>
                            </div>
                            <div className="col-4 p-0 history-btn-container" tabIndex="0">
                              {this.state.historySteps[gameId] > 0 &&
                                <div className="history-btn" onClick={() => this.historyJumpTo(gameId, -1)}>❮</div>
                              }
                            </div>
                            <div className="col-4 p-0 history-btn-container" tabIndex="0">
                              {this.state.historySteps[gameId] < games.history.length - 1 &&
                                <div className="history-btn" onClick={() => this.historyJumpTo(gameId, 1)}>❯</div>
                              }
                            </div>
                          </div>
                          <div>{games.winner ? <span><span className="text-success">Winner:</span> {games.winner}</span> : <span className="text-warning">Draw</span>}</div>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Checks the state of the board and verifies if there's a winner or a draw
 * @param {Array} squares - Array that represents the current state of the board
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      let winner = {
        'symbol': squares[a],
        'line': lines[i],
        'isDraw': false
      }
      return winner;
    }
  }

  let isDraw = true;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      isDraw = false;
      break;
    }
  }

  return {
    symbol: null,
    line: null,
    isDraw: isDraw,
  };
}

export default Game;