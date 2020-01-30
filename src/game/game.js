import React from 'react';
import './game.css';
import db from '../db.js';
import PlayBoard from './board/play-board';
import HistoryBoard from './board/history-board';

class Game extends React.Component {
  constructor(props) {
    super(props);
    if (localStorage.getItem('gameId') === null) {
      localStorage.setItem('gameId', 1)
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
      historySteps: Array(9).fill(0)
    };
  }

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

  /* need to check if there is no more empty squares and declare a draw if needed */

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
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

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  finishGame() {
    const current = this.state.history[this.state.history.length - 1];
    const winner = calculateWinner(current.squares);

    if (!winner) {
      return;
    }

    const game = {
      current: this.state.history[this.state.stepNumber],
      history: this.state.history,
      gameId: this.state.gameId,
      winner: winner,
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

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const lastPlay = step.lastPlay;
      const col = (lastPlay % 3) + 1;
      const row = Math.floor(lastPlay / 3) + 1;
      const desc = move ?
        'Go to move #' + move + " (" + col + "," + row + ")" :
        'Go to game start';
      return (
        <li key={move}>
          <button
            className={this.state.stepNumber === move ? 'font-weight-bold' : ''}
            onClick={() => this.jumpTo(move)}>{desc}
          </button>
        </li>
      )
    })

    let status, submit, reset;
    if (winner) {
      status = 'Winner: ' + winner;
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
                <div className="text-center">{status}</div>
              </div>
              <div className="card-footer row bg-333">
                <div className="col-12 col-md-6 my-1">
                  <PlayBoard
                    squares={current.squares}
                    onClick={(i) => this.handleClick(i)}
                    submit={submit}
                    reset={reset}
                  />
                </div>
                <div className="col-12 col-md-6 bg-666 br-radius-5 my-1 p-2">
                  <div className="game-info">
                    <div>History:</div>
                    <ol>{moves}</ol>
                  </div>
                </div>
              </div>
            </div>
            {
              this.state.games.length > 0 &&
              <div className="card mx-auto my-2 bg-333">
                <div className="row p-2">
                  {
                    this.state.games.length > 0 &&
                    this.state.games.map((games, gameId) => {
                      return (
                        <div key={gameId} className="p-2 text-center">
                          <div>Game #{games.gameId}</div>
                          <HistoryBoard
                            squares={games.current.squares}
                          />
                          <div>Winner: {games.winner}</div>
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
      return squares[a];
    }
  }
  return null;
}

export default Game;