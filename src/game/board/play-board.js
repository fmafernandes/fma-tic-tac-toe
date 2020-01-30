import React from 'react';
import './board.css';
import Square from './square/square';

class PlayBoard extends React.Component {
  renderSquare(i) {
    const winLine = this.props.winner;
    return <Square
      key={i}
      value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)}
      class="square"
      color={winLine && winLine.includes(i) ? "highlight" : ""}
    />;
  }

  render() {
    const submit = this.props.submit;
    const reset = this.props.reset;
    let size = 3;
    let board = [];
    for (let i = 0; i < size; ++i) {
      let row = [];
      for (let j = 0; j < size; ++j) {
        row.push(this.renderSquare(i * size + j))
      }
      board.push(<div key={i} className="board-row">{row}</div>)
    }
    return (
      <div className="mx-auto max-width-300">
        {board}
        <div className="row mx-0">
          <div className="mx-auto col-12 col-sm-6 p-1">
            {reset}
          </div>
          <div className="mx-auto col-12 col-sm-6 p-1">
            {submit}
          </div>
        </div>
      </div>
    );
  }
}

export default PlayBoard;