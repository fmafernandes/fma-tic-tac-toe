import React from 'react';
import './board.css';
import Square from './square/square';

class PlayBoard extends React.Component {
  renderSquare(i) {
    return <Square
      value={this.props.squares[i]}
      onClick={() => this.props.onClick(i)}
      class="square"
    />;
  }

  render() {
    const submit = this.props.submit;
    const reset = this.props.reset;
    return (
      <div className="mx-auto max-width-300">
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