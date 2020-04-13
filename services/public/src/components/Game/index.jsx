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

const Game = ({ history }) => {
  const [{ token }] = useCookies();
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameParams, setGameParams] = useState({
    gameID: null,
    screenName: null,
    host: false,
    gameName: null,
    blackCard: { text: "Some text", pick: 1 },
    whiteCards: [],
    playedCards: [],
    selectedWinner: [],
    players: [],
    showBlackCard: false,
    gameState: "IDLE",
  });

  const adjustParam = (param, value) => {
    setGameParams((prev) => ({ ...prev, [param]: value }));
  };

  useEffect(() => {
    if (!gameParams.id) {
      if (token) {
        axios
          .get("/api/game/details")
          .then(({ data }) => {
            setGameParams(data);
            setLoading(false);
          })
          .catch((err) => {
            if (err.response.status === 403) {
              history.push("/");
            } else {
              setLoading(false);
              throw new Error(err);
            }
          });
      } else {
        history.push("/");
      }
    }
  }, []);

  useEffect(() => {
    let socket;
    const { gameID } = gameParams;
    if (gameID) {
      socket = socketIOClient("/");
      socket.emit("GameData", { gameID });
      socket.on("GameData", (data) => {
        setGameParams((prev) => ({ ...prev, ...data }));
      });
      socket.emit("JoinGame", { gameID });
      socket.on("BLACK_CARD_VISIBLE", (data) => {
        adjustParam("showBlackCard", data);
      });
    }
  }, [gameParams.gameID]);

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

  return loading ? (
    <Loading fullScreen>Loading Game...</Loading>
  ) : (
    <>
      {showInvite && (
        <Invite
          code={gameParams.gameID}
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
    </>
  );
};

export default withRouter(Game);
