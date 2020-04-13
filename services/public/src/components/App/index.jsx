import React from "react";
import { Switch, Route } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import { ThemeProvider } from "react-jss";
import theme from "../../theme";
import ErrorBoundary from "../ErrorBoundary";
import NewGame from "../NewGame";
import Lobby from "../Lobby";
import Game from "../Game";

const App = () => {
  return (
    <div>
      <ErrorBoundary>
        <ThemeProvider theme={theme}>
          <CookiesProvider>
            <Switch>
              <Route path="/game" component={Game} />
              <Route path="/join/:gameID?" component={Lobby} />
              <Route exact component={NewGame} />
            </Switch>
          </CookiesProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
