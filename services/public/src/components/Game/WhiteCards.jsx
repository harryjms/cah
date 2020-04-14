import React, { useState } from "react";
import { useGameContext } from "./index";
import Rail from "../Layout/Rail";
import Card from "../Layout/Card";
const WhiteCards = () => {
  const { game, player } = useGameContext();
  const [selected, setSelected] = useState([]);
  if (!player || !game) {
    return null;
  }

  const {
    currentRound: {
      blackCard: { pick },
    },
  } = game;

  const handleSelect = (card) => {
    let newArray = [...selected];
    if (selected.includes(card)) {
      newArray.splice(selected.indexOf(card), 1);
    } else if (pick === 1) {
      newArray = [card];
    } else if (selected.length < pick) {
      newArray.push(card);
    }
    setSelected(newArray);
  };

  return (
    <Rail>
      {player.hand.map((card) => (
        <Card
          key={card}
          colour="white"
          onClick={() => handleSelect(card)}
          selected={selected.includes(card)}
        >
          {card}
        </Card>
      ))}
    </Rail>
  );
};

export default WhiteCards;
