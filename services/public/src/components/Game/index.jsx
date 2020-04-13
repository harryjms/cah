import React, { useState, useEffect } from "react";
import Rail from "../Rail";
import Card from "../Card";
import { withRouter } from "react-router-dom";
import Loading from "../Loading";
import PlayedCards from "./PlayedCards";
import axios from "axios";
import socketIOClient from "socket.io-client";
import { useCookies } from "react-cookie";
import Invite from "../Invite";

const Game = ({ match }) => {
  const { token } = useCookies();
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameParams, setGameParams] = useState({
    id: null,
    screenName: null,
    host: false,
    gameName: null,
    blackCard: {},
    whiteCards: [],
    playedCards: [],
    selectedWinner: [],
    players: [],
    showBlackCard: false,
    gameState: "IDLE",
  });

  useEffect(() => {
    let socket;
    if (!gameParams.id) {
      axios
        .get("/api/game/details")
        .then(({ data }) => {
          setGameParams(data);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          throw new Error(err);
        });
    }
    // if (gameID) {
    //   socket = socketIOClient("/");
    //   if (gameID !== gameParams._id) {
    //     socket.emit("GameData", { gameID });
    //   }
    //   socket.on("GameData", (data) => setGameParams(data));
    // }
  }, []);

  const deck = () => {
    const { gameState, host } = gameParams;
    switch (gameState) {
      case "IDLE":
        return <Loading>Waiting for game to begin...</Loading>;
      case "READING":
        return <PlayedCards cards={gameParams.playedCards} />;
      case "SELECTING":
        return null;
    }
  };

  return (
    <>
      {showInvite && (
        <Invite
          code={match.params.gameID}
          onDismiss={() => setShowInvite(false)}
        />
      )}
      <button onClick={() => setShowInvite(true)}>Invite</button>
      {gameParams.gameName && <h2>{gameParams.gameName}</h2>}
      <Rail>
        <Card
          colour="black"
          hideValue={!gameParams.showBlackCard}
          pick={gameParams.blackCard.pick}
        >
          {gameParams.blackCard.text}
        </Card>
        {deck()}
      </Rail>
      <Rail selectable>
        {gameParams.whiteCards.map((card) => (
          <Card colour="white" key={card}>
            {card}
          </Card>
        ))}
      </Rail>
      {loading && <Loading fullScreen>Loading Game</Loading>}
    </>
  );
};

export default withRouter(Game);
