import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import Button from "../Button";
import Loading from "../Loading";
import Invite from "../Invite";

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

const GameBar = ({ game }) => {
  const classes = useStyles();
  const [showInvite, setShowInvite] = useState(false);
  const handleInvite = () => {
    setShowInvite((prev) => !prev);
  };
  return (
    <div className={classes.GameBar}>
      {showInvite && <Invite code={game.gameID} onDismiss={handleInvite} />}
      <div className="content">
        <h2>{game.gameName}</h2>
        <Button style={{ width: "auto" }} onClick={handleInvite}>
          Invite
        </Button>
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
