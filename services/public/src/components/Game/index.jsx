import React, { useState, useEffect } from "react";
import Rail from "../Layout/Rail";
import Card from "../Layout/Card";
import { withRouter } from "react-router-dom";
import Loading from "../Layout/Loading";
import PlayedCards from "./PlayedCards";
import axios from "axios";
import socketIOClient from "socket.io-client";
import { useCookies } from "react-cookie";
import Invite from "../Layout/Invite";
import Notification from "../Layout/Notification";

import GameBar from "./GameBar";

const Game = ({ history }) => {
  // State: The Game
  const [player, setPlayer] = useState(null);
  const [game, setGame] = useState(null);

  // States: UI
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [connectionLost, setConnectionLost] = useState(false);

  useEffect(() => {
    const getPlayer = async () => {
      try {
        const { data } = await axios.get("/api/me");
        setPlayer(data);
      } catch (err) {
        throw new Error(err);
      }
    };
    getPlayer();
  }, []);

  useEffect(() => {
    if (player && player.gameID) {
      const socket = socketIOClient("/");
      socket.on("disconnect", handleDisconnection);
      socket.on("reconnect", handleReconnection);

      socket.on("GameData", handleGameData);
      socket.on("Notification", handleNotification);

      socket.emit("GetGame");
    }
  }, [player]);

  const handleGameData = (data) => {
    setGame(data);
    if (loading) {
      setLoading(false);
    }
  };

  const handleNotification = (data) => {
    setNotifications((prev) => [...prev, data]);
  };

  const handleDisconnection = () => {
    setConnectionLost(true);
  };

  const handleReconnection = () => {
    setConnectionLost(false);
  };

  const deck = () => {
    const { gameState, host } = game;
    switch (gameState) {
      case "READING":
        return <PlayedCards cards={game.currentRound.whiteCards} />;
      case "SELECTING":
        return null;
    }
  };

  return loading ? (
    <Loading fullScreen>Loading Game...</Loading>
  ) : (
    <>
      <GameBar game={game} />
      <Rail>
        <Card
          colour="black"
          hideValue={!game.currentRound.showBlack}
          pick={game.currentRound.blackCard.pick}
        >
          {game.currentRound.blackCard.text}
        </Card>
        {deck()}
      </Rail>
      <Rail selectable>
        {game.currentRound.whiteCards.map((card) => (
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
