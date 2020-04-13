import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import axios from "axios";
import loaderGif from "../../assets/images/loader.gif";

import { HStack } from "../Stack";
import TextField from "../TextField";
import Button from "../Button";
import Banner from "../Banner";
import Loading from "../Loading";

const NewGame = ({ history }) => {
  const [gameName, setGameName] = useState("");
  const [screenName, setScreenName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const canSave = screenName !== "" && gameName !== "";

  const handleGameName = (e) => {
    setGameName(e.target.value);
  };

  const handleScreenName = (e) => {
    setScreenName(e.target.value);
  };

  const handleButton = () => {
    setLoading(true);
    setError(null);
    axios
      .post("/api/game/new", { screenName, gameName })
      .then(({ data: game }) => {
        console.log(game);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <h1>Cards Against</h1>
      <h2>New Game</h2>
      <div>
        <HStack>
          <TextField
            label="Screen Name"
            value={screenName}
            onChange={handleScreenName}
            disabled={loading}
          />
          <TextField
            label="Game Name"
            value={gameName}
            onChange={handleGameName}
            disabled={loading}
          />
          {loading ? (
            <Loading fullScreen>Creating game...</Loading>
          ) : (
            <Button onClick={handleButton} disabled={!canSave}>
              Create Game
            </Button>
          )}
        </HStack>
        {error && (
          <Banner colour="red">Sorry, something went wrong. Try again.</Banner>
        )}
      </div>
    </div>
  );
};

export default withRouter(NewGame);
