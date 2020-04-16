import React from "react";
import { createUseStyles } from "react-jss";
import Rail from "../Layout/Rail";
import { useGameContext } from ".";
import Card from "../Layout/Card";
import Fullscreen from "../Layout/Fullscreen";

const useStyles = createUseStyles({
  Winning: {
    width: "100%",
  },
});
const WinningHand = () => {
  const { game } = useGameContext();
  const classes = useStyles();

  const {
    currentRound: { blackCard, winner },
  } = game;
  return (
    <Fullscreen>
      <div className={classes.Winning}>
        <h2 style={{ marginLeft: 20 }}>Winning Hand</h2>
        <Rail>
          <Card colour="black" style={{ marginLeft: 20 }}>
            {blackCard.text}
          </Card>
          {winner.map((card) => (
            <Card colour="white" key={card}>
              {card}
            </Card>
          ))}
        </Rail>
      </div>
    </Fullscreen>
  );
};

export default WinningHand;
