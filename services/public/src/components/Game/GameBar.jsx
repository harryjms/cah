import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import axios from "axios";
import Button from "../Layout/Button";
import Loading from "../Layout/Loading";
import Invite from "../Layout/Invite";
import { useGameContext } from "./index";

const useStyles = createUseStyles({
  GameBar: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    "& .content": {
      display: "flex",
      alignItems: "center",
    },
    "& .buttons": {
      display: "flex",
      whiteSpace: "nowrap",
      "& button": {
        marginRight: 5,
      },
    },
    "& h2": {
      margin: 0,
      textOverflow: "elipsis",
      whiteSpace: "nowrap",
      width: "100%",
    },
    "& button": {
      alignSelf: "flex-end",
    },
  },
});

const GameBar = () => {
  const { game, player } = useGameContext();
  const classes = useStyles();
  const [showInvite, setShowInvite] = useState(false);
  const isHost = game && player && game.host === player.name;

  const handleInvite = () => {
    setShowInvite((prev) => !prev);
  };

  const handleStartGame = () => {
    axios.put("/api/game/start").catch((err) => {
      throw new Error(err);
    });
  };

  return (
    <div className={classes.GameBar}>
      {showInvite && <Invite code={game._id} onDismiss={handleInvite} />}
      <div className="content">
        <h2>{game.name}</h2>
        <div className="buttons">
          {isHost &&
            (game.gameState === "IDLE" ? (
              <Button onClick={handleStartGame}>Start Game</Button>
            ) : (
              <Button>End Game</Button>
            ))}
          {game.gameState === "IDLE" && (
            <Button style={{ width: "auto" }} onClick={handleInvite}>
              Invite
            </Button>
          )}
        </div>
      </div>
      <div>
        {game.gameState === "IDLE" && (
          <Loading>Waiting for game to start...</Loading>
        )}
      </div>
    </div>
  );
};

export default GameBar;
