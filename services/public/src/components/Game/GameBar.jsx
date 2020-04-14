import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import Button from "../Layout/Button";
import Loading from "../Layout/Loading";
import Invite from "../Layout/Invite";

const useStyles = createUseStyles({
  GameBar: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    "& .content": {
      display: "flex",
      alignItems: "center",
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

const GameBar = ({ game, player, actions }) => {
  const classes = useStyles();
  const [showInvite, setShowInvite] = useState(false);
  const isHost = game && player && game.host === player.name;
  const handleInvite = () => {
    setShowInvite((prev) => !prev);
  };
  return (
    <div className={classes.GameBar}>
      {showInvite && <Invite code={game._id} onDismiss={handleInvite} />}
      <div className="content">
        <h2>{game.name}</h2>
        <Button style={{ width: "auto" }} onClick={handleInvite}>
          Invite
        </Button>
      </div>
      <div>
        {game.gameState === "IDLE" && (
          <Loading>Waiting for game to start...</Loading>
        )}
      </div>
      {isHost && (
        <div>
          {game.gameState === "IDLE" ? (
            <Button onClick={actions.handleStartGame}>Start Game</Button>
          ) : (
            <Button>End Game</Button>
          )}
        </div>
      )}
    </div>
  );
};

export default GameBar;
