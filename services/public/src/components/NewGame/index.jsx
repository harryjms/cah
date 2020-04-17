import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import axios from "axios";

import { HStack } from "../Layout/Stack";
import TextField from "../Layout/TextField";
import Button from "../Layout/Button";
import Banner from "../Layout/Banner";
import Loading from "../Layout/Loading";
import { useCookies } from "react-cookie";

const NewGame = ({ history }) => {
  const [cookies, setCookie, removeCookie] = useCookies();
  const [gameName, setGameName] = useState("");
  const [screenName, setScreenName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const canSave = screenName !== "" && gameName !== "";

  useEffect(() => {
    removeCookie("token");
  }, []);

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
      .post("/api/game", {
        screenName,
        gameName,
        additionalPacks: ["plymouth"],
      })
      .then(({ data: gameID }) => {
        history.push("/game");
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
