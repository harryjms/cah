import React, { useState } from "react";
import Rail from "../Rail";
import Card from "../Card";
import { withRouter } from "react-router-dom";
import CardStack from "../CardStack";

const Game = ({ match }) => {
  const { gameID } = match.params;
  const [hideCard, setHideCard] = useState(false);
  const [blackCard, setBlackCard] = useState({
    text: "I got 99 problems but _ ain't one.",
    pick: 1,
  });
  const [spread, setSpread] = useState(null);
  const [whiteCards, setWhiteCards] = useState(["Dick envy"]);
  const [playedCards, setPlayedCards] = useState([
    "Dick envy",
    "A gaping vagina",
  ]);

  const handleSpreadStack = (i) => {
    if (spread !== i) {
      setSpread(i);
    } else {
      setSpread(null);
    }
  };
  return (
    <>
      <Rail>
        <Card colour="black" hideValue={hideCard} pick={blackCard.pick}>
          {blackCard.text}
        </Card>
        {playedCards.map((card, i) => {
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
        })}
      </Rail>
      <Rail selectable>
        {whiteCards.map((card) => (
          <Card colour="white" key={card}>
            {card}
          </Card>
        ))}
      </Rail>
    </>
  );
};

export default withRouter(Game);
