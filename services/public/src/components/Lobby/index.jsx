import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import { createUseStyles } from "react-jss";
import { HStack } from "../Stack";
import TextField from "../TextField";
import Button from "../Button";

const useStyles = createUseStyles({});

const Lobby = ({ match }) => {
  const { gameID } = match.params;
  const [screenName, setScreenName] = useState("");

  const handleName = (e) => {
    const { value } = e.target;
    setScreenName(value);
  };

  const handleJoin = () => {};

  return (
    <div>
      <h1>Cards Against Hummanity</h1>
      {gameID ? (
        <HStack>
          <TextField
            value={screenName}
            label="Screen Name"
            onChange={handleName}
            style={{ marginRight: 10 }}
          />
          <Button>Enter Game</Button>
        </HStack>
      ) : (
        "No Game to join"
      )}
    </div>
  );
};

export default withRouter(Lobby);
