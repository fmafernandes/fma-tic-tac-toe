import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import db from './db';

function Square(props) {
  return (
    <button
      className={props.class}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

/* function Square(props) {
  return (
    <button
      className="square"
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
} */

/* make an abstraction of AbstractBoard to Board and HistoryBoard */

class Board extends React.Component {
  renderSquare(i) {
    return <Square
      value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)}
      class="square"
    />;
  }

  render() {
    const submit = this.props.submit;
    return (
      <div className="mx-auto fit-width">
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
        <div className="row mx-0">
          <div className="mx-auto col-6 p-1">
            <button className="btn btn-primary w-100" onClick={() => alert("Does nothing.")}>Start Over</button>
          </div>
          <div className="mx-auto col-6 p-1">
            {submit}
          </div>
        </div>
      </div>
    );
  }
}

class HistoryBoard extends React.Component {
  renderSquare(i) {
    return <Square
      value={this.props.squares[i]}
      class="small-square"
    />;
  }

  render() {
    return (
      <div className="mx-auto fit-width">
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    if (localStorage.getItem('gameId') === null) {
      localStorage.setItem('gameId', 0)
    }
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      games: [],
      gameId: localStorage.getItem('gameId')
    };
  }

  componentDidMount() {
    db.table('games')
      .toArray()
      .then((games) => {
        this.setState({ games });
        console.log(this.state.games)
      });
  }

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
    const game = {
      current: this.state.history[this.state.stepNumber],
      history: this.state.history,
      gameId: this.state.gameId
    }

    db.table('games')
      .put(game)
      .then((gameId) => {
        const newList = [...this.state.games, Object.assign({}, game, { gameId })];
        this.setState({ games: newList });
      });
    localStorage.setItem('gameId', Number(this.state.gameId) + 1);
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      )
    })

    let status, submit;
    if (winner) {
      status = 'Winner: ' + winner;
      submit = <button className="btn btn-success w-100" onClick={() => this.finishGame()}>Submit</button>
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div>
        <div className="game row mx-0">
          <div className="game-board col-12">
            <div className="game-info">
              <h1 className="text-center">Tic Tac Toe</h1>
              <div>{status}</div>
            </div>
            <Board
              squares={current.squares}
              onClick={(i) => this.handleClick(i)}
              submit={submit}
            />
            <div className="game-info">
              <div>History:</div>
              <ol>{moves}</ol>
            </div>
          </div>
        </div>
        <div className="row">
          {
            this.state.games.length > 0 &&
            this.state.games.map((games, gameId) => {
              return (
                <div key={gameId} className="p-2">
                  <div>Jogo nº {gameId}</div>
                  <HistoryBoard
                    squares={games.current.squares}
                  />
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

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

serviceWorker.register()