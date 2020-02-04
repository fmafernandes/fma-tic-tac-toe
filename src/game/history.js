import React from 'react';
import './game.css';
import db from '../db.js';
import HistoryBoard from './board/history-board';

class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      games: [],
      historySteps: Array(9).fill(0)
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
   * Handles arrow key events related to browsing saved games' steps
   * @param {Event} e - Event object
   * @param {Number} gameId - ID that uniquely identifies the game to be browsed through
   */
  handleHistoryKeyDown(e, gameId) {
    if (e.keyCode === 37) {
      this.historyJumpTo(gameId, -1)
    } else if (e.keyCode === 39) {
      this.historyJumpTo(gameId, 1)
    }
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

  render() {
    return (
      <div className="col-12">
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
    );
  }
}


export default History;