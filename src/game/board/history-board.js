import React from 'react';
import './board.css';
import Square from './square/square';

/**
 * Board intended for display of previous results
 */
class HistoryBoard extends React.Component {
  /**
   * Creates individual square for the History board with the given attributes
   * @param {number} i - Index that uniquely identifies each square of the board
   */
  renderSquare(i) {
    const winLine = this.props.winner;
    return <Square
      key={i}
      value={this.props.squares[i]}
      class="small-square"
      color={winLine && winLine.includes(i) ? "highlight" : ""}
    />;
  }

  render() {
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
      <div className="mx-auto">
        {board}
      </div>
    );
  }
}

export default HistoryBoard;