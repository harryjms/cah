import React, { useState } from "react";
import { useGameContext } from "./index";
import Rail from "../Layout/Rail";
import Card from "../Layout/Card";
const WhiteCards = () => {
  const { game, player, handSelection, handleHandSelection } = useGameContext();

  if (!player || !game) {
    return null;
  }

  const {
    currentRound: {
      blackCard: { pick },
    },
  } = game;

  return (
    <Rail>
      {player.hand.map((card) => (
        <Card
          key={card}
          colour="white"
          onClick={() => handleHandSelection(card)}
          selected={handSelection.includes(card)}
        >
          {card}
        </Card>
      ))}
    </Rail>
  );
};

export default WhiteCards;
