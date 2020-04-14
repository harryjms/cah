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
import Notification from "../Notification";

import GameBar from "./GameBar";

const Game = ({ history }) => {
  const [{ token }] = useCookies();
  const [showInvite, setShowInvite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [connectionLost, setConnectionLost] = useState(false);
  const [gameParams, setGameParams] = useState({
    gameID: null,
    screenName: null,
    host: false,
    gameName: null,
    blackCard: { text: "Some text", pick: 1 },
    whiteCards: [],
    playedCards: [],
    selectedWinner: [],
    players: ["scratchedguitar", "lampy", "donky"],
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
            if (err.response.status === 403 || err.response.status === 404) {
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
      socket.on("NOTIFICATION", (data) => {
        setNotifications((prev) => [...prev, data]);
      });
      socket.on("disconnect", () => {
        setConnectionLost(true);
      });
      socket.on("reconnect", () => {
        setConnectionLost(false);
      });
    }
  }, [gameParams.gameID]);

  const deck = () => {
    const { gameState, host } = gameParams;
    switch (gameState) {
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
      <GameBar game={gameParams} />
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
      {notifications.map((not) => (
        <Notification key={not} show>
          {not}
        </Notification>
      ))}
      {connectionLost && (
        <Loading fullScreen>Reconnecting to server...</Loading>
      )}
    </>
  );
};

export default withRouter(Game);
