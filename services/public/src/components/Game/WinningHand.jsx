import React, { useState, useEffect } from "react";
import { createUseStyles } from "react-jss";
import Rail from "../Layout/Rail";
import { useGameContext } from ".";
import Card from "../Layout/Card";
import Fullscreen from "../Layout/Fullscreen";
import moment from "moment";

const useStyles = createUseStyles({
  Winning: {
    width: "100%",
  },
  countdown: {
    padding: 20,
  },
});
const WinningHand = () => {
  const { game } = useGameContext();
  const classes = useStyles();
  const [countDown, setCountDown] = useState(8);

  const {
    currentRound: { blackCard, winner },
  } = game;
  if (!winner) {
    return null;
  }
  const { screenName, hand } = winner;

  useEffect(() => {
    let timer = setInterval(() => {
      const time =
        moment(game.currentRound.nextRoundAt).diff(moment(), "seconds") + 1;
      setCountDown(time);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Fullscreen>
      <div className={classes.Winning}>
        <h2 style={{ marginLeft: 20 }}>
          Winning Hand -{" "}
          <span style={{ fontWeight: "normal" }}>{screenName}</span>
        </h2>
        <Rail>
          <Card colour="black" style={{ marginLeft: 20 }}>
            {blackCard.text}
          </Card>
          {hand.map((card) => (
            <Card colour="white" key={card}>
              {card}
            </Card>
          ))}
        </Rail>
        <div className={classes.countdown}>
          Next round in {countDown} seconds
        </div>
      </div>
    </Fullscreen>
  );
};

export default WinningHand;
