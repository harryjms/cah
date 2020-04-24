import React from "react";
import { createUseStyles } from "react-jss";
import { useGameContext } from ".";
import Button from "../Layout/Button";

const PlayerStates = {
  CZAR: "👑 Czar",
  IDLE: "Waiting",
  SELECTING: "Selecting",
  SELECTED: "Selected Card",
};

const useStyles = createUseStyles({
  ul: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    "& li": {
      padding: "5px 0",
    },
  },
});

const Players = ({ onDismiss }) => {
  const classes = useStyles();
  const { allPlayers } = useGameContext();
  if (!allPlayers) {
    return null;
  }

  return (
    <div>
      <ul className={classes.ul}>
        {allPlayers.map((player) => (
          <li key={player.name}>
            {player.name} - {PlayerStates[player.state]}
          </li>
        ))}
      </ul>
      <center>
        <Button onClick={() => onDismiss()} style={{ marginTop: 30 }}>
          Done
        </Button>
      </center>
    </div>
  );
};
export default Players;
