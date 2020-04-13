import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import { createUseStyles } from "react-jss";
import axios from "axios";
import { HStack } from "../Stack";
import TextField from "../TextField";
import Button from "../Button";
import loadingGif from "../../assets/images/loader.gif";

const useStyles = createUseStyles({
  loading: {
    display: "flex",
    alignItems: "center",
    marginTop: 10,
    "& img": { width: 32 },
  },
  error: {
    marginTop: 10,
    color: "red",
    fontWeight: "bold",
  },
});

const Lobby = ({ match, history }) => {
  const classes = useStyles();
  const { gameID } = match.params;
  const [screenName, setScreenName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleName = (e) => {
    const { value } = e.target;
    setScreenName(value);
  };

  const handleJoin = () => {
    if (screenName !== "") {
      setLoading(true);
      axios
        .post("/api/player/join-game", { game: gameID, name: screenName })
        .then(() => {
          history.push("/game/" + gameID);
        })
        .catch((err) => {
          console.error(err);
          setError(err.response.data.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <div>
      <h1>Cards Against Hummanity</h1>
      {gameID ? (
        <>
          <h2>Join Game</h2>
          <HStack>
            <TextField
              value={screenName}
              label="Screen Name"
              onChange={handleName}
              style={{ marginRight: 10 }}
              disabled={loading}
            />
            {loading ? (
              <div className={classes.loading}>
                <img src={loadingGif} /> Joining game...
              </div>
            ) : (
              <Button
                onClick={handleJoin}
                disabled={screenName === "" || loading}
              >
                Join Game
              </Button>
            )}
          </HStack>
          {error && <div className={classes.error}>{error}</div>}
        </>
      ) : (
        "No Game to join"
      )}
    </div>
  );
};

export default withRouter(Lobby);
