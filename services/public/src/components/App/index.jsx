import React from "react";
import { Switch, Route } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import ErrorBoundary from "../ErrorBoundary";
import NewGame from "../NewGame";
import Lobby from "../Lobby";
import Game from "../Game";

const App = () => {
  return (
    <div>
      <ErrorBoundary>
        <CookiesProvider>
          <Switch>
            <Route path="/game" component={Game} />
            <Route path="/join/:gameID?" component={Lobby} />
            <Route exact component={NewGame} />
          </Switch>
        </CookiesProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
