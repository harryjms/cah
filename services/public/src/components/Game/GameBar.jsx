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
      "& .status": {
        marginRight: 5,
      },
      "& button": {
        marginRight: 5,
      },
    },
    "& h2": {
      margin: 0,
      textOverflow: "elipsis",
      whiteSpace: "nowrap",
      width: "100%",
      "& span": {
        fontWeight: "normal",
        fontSize: "0.8em",
        marginLeft: 10,
      },
    },
    "& button": {
      alignSelf: "flex-end",
    },
  },
});

const GameBar = () => {
  const { game, player, allPlayers } = useGameContext();
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
        <h2>
          {game.name}{" "}
          <span>
            {allPlayers.length} {allPlayers.length === 1 ? "Player" : "Players"}
          </span>
        </h2>
        <div className="buttons">
          <div className="status">
            {game.gameState === "IDLE" && (
              <Loading>Waiting for game to start...</Loading>
            )}
          </div>
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
      <div></div>
    </div>
  );
};

export default GameBar;
