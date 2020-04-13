import React, { useState } from "react";
import Rail from "../Rail";
import Card from "../Card";
import { withRouter } from "react-router-dom";

const Game = ({ match }) => {
  const { gameID } = match.params;
  const [hideCard, setHideCard] = useState(true);
  const [blackCard, setBlackCard] = useState({
    text: "I got 99 problems but _ ain't one.",
    pick: 1,
  });
  const [whiteCards, setWhiteCards] = useState(["Dick envy"]);

  return (
    <>
      <Rail>
        <Card colour="black" hideValue={hideCard} pick={blackCard.pick}>
          {blackCard.text}
        </Card>
        <Card colour="white">Dick envy</Card>
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
