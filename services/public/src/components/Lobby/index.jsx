import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import { withRouter } from "react-router-dom";
import axios from "axios";

import Title from "../Layout/Title";
import TextField from "../Layout/TextField";
import Button from "../Layout/Button";
import Banner from "../Layout/Banner";
import Checkbox from "../Layout/Checkbox";

const useStyles = createUseStyles((theme) => ({
  Lobby: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    display: "flex",
    flexFlow: "column",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    width: 300,
    height: 444.42,
    maxWidth: 500,
    textAlign: "left",
    margin: 30,
    boxShadow: "-1px 0 5px 0 #c5c5c5",
    // [theme.mediaQuery.darkMode]: {
    //   boxShadow: "-1px 0 5px 0 #252525",
    // },
    "&.black": {
      backgroundColor: "#000",
      color: "#FFF",
      "& button": {
        backgroundColor: "white",
        color: "black",
      },
    },
    "& .group": {
      flex: 1,
      flexFlow: "column",
      "&:nth-of-type(2)": {
        display: "flex",
        flex: 2,
        justifyContent: "center",
      },
      "&:nth-of-type(3)": {
        display: "flex",
        justifyContent: "flex-end",
      },
    },
    "& h1, h2": {
      margin: 5,
    },

    "& h2": {
      marginBottom: 50,
    },
    "& label": {
      width: "100%",
      textAlign: "left",
    },
    "& input": {
      margin: 0,
      marginBottom: 10,
    },
  },
}));

const Lobby = ({ history, match }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [screenName, setScreenName] = useState("");
  const [gameName, setGameName] = useState("");
  const [error, setError] = useState(null);
  const [includePlymouth, setIncludePlymouth] = useState(false);

  const isNewGame = match.path.indexOf("/join") == -1;
  const gameID = match.params.gameID;

  const handleScreenName = (e) => {
    setScreenName(e.target.value);
  };

  const handleGameName = (e) => {
    setGameName(e.target.value);
  };

  const handleNewGame = () => {
    setLoading(true);
    setError(null);
    axios
      .post("/api/game", {
        screenName,
        gameName,
        additionalPacks: includePlymouth ? ["plymouth"] : [],
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

  const handleJoin = () => {
    if (screenName !== "") {
      setLoading(true);
      setError(null);
      axios
        .post("/api/game/join", { gameID, screenName })
        .then(() => {
          history.push("/game");
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

  const title = isNewGame ? "New Game" : "Join Game";
  const color = isNewGame ? "black" : "white";
  const button = isNewGame ? "Start" : "Join";

  return (
    <div className={classes.Lobby}>
      <div className={[classes.content, color].filter((a) => a).join(" ")}>
        <div className="group">
          <Title />
          <h2>{title}</h2>
        </div>
        <div className="group">
          <TextField
            label="Screen name"
            disabled={loading}
            onChange={handleScreenName}
            value={screenName}
          />
          {isNewGame && (
            <>
              <TextField
                label="Game name"
                disabled={loading}
                onChange={handleGameName}
                value={gameName}
              />
              <Checkbox label="Base UK Pack" readOnly checked />
              <Checkbox
                label="Plymouth Pack"
                checked={includePlymouth}
                onChange={() => {
                  setIncludePlymouth((prev) => !prev);
                }}
              />
            </>
          )}
          {error && <Banner colour="red">Sorry, something went wrong.</Banner>}
        </div>
        <div className="group">
          <Button
            processing={loading}
            onClick={isNewGame ? handleNewGame : handleJoin}
            style={{ width: "100%" }}
          >
            {button}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default withRouter(Lobby);
