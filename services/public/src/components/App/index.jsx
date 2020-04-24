import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { CookiesProvider } from "react-cookie";

import { ThemeProvider } from "react-jss";
import theme from "../../theme";
import ErrorBoundary from "../ErrorBoundary";
import Lobby from "../Lobby";
import Game from "../Game";
import Error404 from "../Error404";

const App = () => {
  return (
    <div>
      <ErrorBoundary>
        <ThemeProvider theme={theme}>
          <CookiesProvider>
            <Switch>
              <Route path="/game" exact component={Game} />
              <Route
                path="/game/:gameID"
                exact
                render={({ match }) => (
                  <Redirect to={`/join/${match.params.gameID}`} />
                )}
              />
              <Route path="/join/:gameID?" component={Lobby} />
              <Route path="/" exact component={Lobby} />
              <Route component={Error404} />
            </Switch>
          </CookiesProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
