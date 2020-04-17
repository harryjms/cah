import React from "react";
import { createUseStyles } from "react-jss";
import Fullscreen from "../Layout/Fullscreen";
import Title from "../Layout/Title";
import Button from "../Layout/Button";
import { useGameContext } from ".";

const useStyles = createUseStyles({
  EndScreen: {
    width: "100%",
    padding: 20,
    textAlign: "center",
    "& table": {
      margin: "0 auto",
      marginTop: 20,
      "& thead": {
        fontWeight: "bold",
      },
      "& td": {
        padding: 8,
      },
    },
  },
});

const EndScreen = () => {
  const classes = useStyles();
  const { winners } = useGameContext();
  return (
    <Fullscreen>
      <div className={classes.EndScreen}>
        <Title />
        The game has now ended.
        <br />
        <table>
          <thead>
            <tr>
              <td>Player</td>
              <td>Rounds Won</td>
            </tr>
          </thead>
          <tbody>
            {winners.map((winner) => (
              <tr key={`winner-${winner.screenName}`}>
                <td>{winner.screenName}</td>
                <td>{winner.roundsWon}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button
          onClick={() => (window.location = "/")}
          style={{ width: "auto", marginTop: 20 }}
        >
          Start a new game
        </Button>
      </div>
    </Fullscreen>
  );
};
export default EndScreen;
