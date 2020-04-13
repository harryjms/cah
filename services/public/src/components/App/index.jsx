import React from "react";
import { Switch, Route } from "react-router-dom";
import NewGame from "../NewGame";
import Lobby from "../Lobby";
import Game from "../Game";

const App = () => {
  return (
    <div>
      <Switch>
        <Route path="/game" component={Game} />
        <Route path="/join/:gameID?" component={Lobby} />
        <Route exact component={NewGame} />
      </Switch>
    </div>
  );
};

export default App;
