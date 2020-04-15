import React, { useState } from "react";
import Card from "../Layout/Card";
import CardStack from "../Layout/CardStack";
import { useGameContext } from ".";

const PlayedCards = () => {
  const {
    game: {
      currentRound: { whiteCards, showWhite },
    },
  } = useGameContext();
  const [spread, setSpread] = useState(null);

  const handleSpreadStack = (i) => {
    if (spread !== i) {
      setSpread(i);
    } else {
      setSpread(null);
    }
  };
  return whiteCards.map((card, i) => {
    if (Array.isArray(card)) {
      return (
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
      );
    }
    return (
      <Card colour="white" key={card} hideValue={!showWhite}>
        {card}
      </Card>
    );
  });
};
export default PlayedCards;
