import React, { useState } from "react";
import Card from "../Card";
import CardStack from "../CardStack";

const PlayedCards = ({ cards }) => {
  const [spread, setSpread] = useState(null);

  const handleSpreadStack = (i) => {
    if (spread !== i) {
      setSpread(i);
    } else {
      setSpread(null);
    }
  };
  return cards.map((card, i) => {
    if (Array.isArray(card)) {
      return (
        <CardStack
          key={`stack-${i}`}
          spread={spread === i}
          onClick={() => handleSpreadStack(i)}
        >
          {card.map((c) => (
            <Card colour="white" key={c}>
              {c}
            </Card>
          ))}
        </CardStack>
      );
    }
    return (
      <Card colour="white" key={card}>
        {card}
      </Card>
    );
  });
};
export default PlayedCards;
