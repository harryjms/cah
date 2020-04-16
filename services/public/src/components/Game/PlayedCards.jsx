import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import Card from "../Layout/Card";
import CardStack from "../Layout/CardStack";
import Button from "../Layout/Button";
import { useGameContext } from ".";
import axios from "axios";

const useStyles = createUseStyles({
  CardOption: {
    position: "relative",
    "& .button": {
      position: "absolute",
      bottom: 5,
      right: 5,
      left: 5,
      zIndex: 999,
      padding: "0 10px",
      "& button": {
        width: "100%",
      },
    },
  },
});

const PlayedCards = () => {
  const classes = useStyles();
  const {
    game: {
      currentRound: { whiteCards, showWhite },
    },
    player,
  } = useGameContext();
  const [spread, setSpread] = useState(null);

  const handleSpreadStack = (i) => {
    if (!showWhite) {
      return;
    }
    if (spread !== i) {
      setSpread(i);
    } else {
      setSpread(null);
    }
  };

  const handleSelectWinner = (hand) => {
    axios.post("/api/game/winner", { hand }).catch((err) => {
      console.error(err);
      alert(err.response.data.message);
    });
  };
  return whiteCards.map((card, i) => {
    return (
      <div className={classes.CardOption} key={i}>
        <div className="cards">
          {Array.isArray(card) ? (
            <CardStack
              key={`stack-${i}`}
              spread={spread === i}
              onClick={() => handleSpreadStack(i)}
            >
              {card.map((c, cn) => (
                <Card
                  colour="white"
                  key={c}
                  hideValue={!showWhite}
                  cardNumber={cn + 1}
                >
                  {c}
                </Card>
              ))}
            </CardStack>
          ) : (
            <Card colour="white" key={card} hideValue={!showWhite}>
              {card}
            </Card>
          )}
        </div>
        {player.state === "CZAR" && showWhite && (
          <div className="button">
            <Button onClick={() => handleSelectWinner(card)}>Select</Button>
          </div>
        )}
      </div>
    );
  });
};
export default PlayedCards;
