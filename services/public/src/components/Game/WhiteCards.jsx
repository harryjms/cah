import React, { useState } from "react";
import { useGameContext } from "./index";
import Rail from "../Layout/Rail";
import Card from "../Layout/Card";
import findIndex from "lodash/findIndex";

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

  const canSelect = player.state === "SELECTING";

  return (
    <Rail>
      {player.hand.map((card) => {
        const cardNumber = findIndex(handSelection, (h) => h === card) + 1;
        return (
          <Card
            key={card}
            colour="white"
            onClick={canSelect ? () => handleHandSelection(card) : null}
            selected={handSelection.includes(card)}
            cardNumber={pick > 1 && cardNumber > 0 && cardNumber}
            style={{
              ...(player.state !== "SELECTING" && {
                opacity: 0.4,
                cursor: "default",
              }),
            }}
          >
            {card}
          </Card>
        );
      })}
    </Rail>
  );
};

export default WhiteCards;
