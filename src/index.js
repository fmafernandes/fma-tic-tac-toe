import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Game from './game/game';
import History from './game/history';
import About from './game/about';
import * as serviceWorker from './serviceWorker';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from "react-router-dom";

ReactDOM.render(
  <Router>
    <div>
      <div className="container">
        <nav className="navbar navbar-expand-sm justify-content-sm-center">
          <NavLink activeClassName="active-link-color" className="link-color mt-1" exact={true} to="/">
            <h2 className="d-inline-block text-center px-3">Tic Tac Toe</h2>
          </NavLink>
          <div className="cross-btn-container">
            <button className="navbar-toggler navbar-toggler-right collapsed" type="button" data-toggle="collapse"
              data-target="#collapsableNavbar">
              <span> </span>
              <span> </span>
              <span> </span>
            </button>
          </div>
          <div className="collapse navbar-collapse" id="collapsableNavbar">
            <div className="navbar-nav text-center">
              <NavLink activeClassName="active-link-color" className="link-color" to="/history"><div className="d-inline-block text-center px-3">History</div></NavLink>
              <NavLink activeClassName="active-link-color" className="link-color" to="/about"><div className="d-inline-block text-center px-3">About</div></NavLink>
            </div>
          </div>
        </nav>
        {/*         <nav className="navbar justify-content-center">
          <NavLink activeClassName="active-link-color" className="link-color" exact={true} to="/"><h1 className="d-inline-block text-center px-3">Tic Tac Toe</h1></NavLink>
          <NavLink activeClassName="active-link-color" className="link-color" to="/history"><div className="d-inline-block text-center px-3">History</div></NavLink>
          <NavLink activeClassName="active-link-color" className="link-color" to="/about"><div className="d-inline-block text-center px-3">About</div></NavLink>
        </nav> */}
      </div>
      <Switch>
        <Route path="/history">
          <History />
        </Route>
        <Route path="/about">
          <About />
        </Route>
        <Route path="/">
          <Game />
        </Route>
      </Switch>
    </div>
  </Router>,
  document.getElementById('root')
);

serviceWorker.register()