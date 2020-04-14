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
import Socket from "../../helpers/socket";

const Game = ({ history }) => {
  // State: The Game
  const [player, setPlayer] = useState(null);
  const [game, setGame] = useState(null);
  const [whiteCards, setWhiteCards] = useState([]);

  // States: UI
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [connectionLost, setConnectionLost] = useState(false);

  let socket;

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

    return () => {
      socket = null;
    };
  }, []);

  useEffect(() => {
    if (player && player.gameID) {
      socket = new Socket();
      socket.on("disconnect", handleDisconnection);
      socket.on("reconnect", () => {
        socket.emit("GetGame");
        handleReconnection();
      });

      socket.on("GameData", handleGameData);
      socket.on("Notification", handleNotification);
      socket.on("WHITE_CARD", handleWhiteCard);

      socket.emit("GetGame");
    }
  }, [player]);

  const handleGameData = (data) => {
    console.log(data);
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

  const handleStartGame = () => {
    axios.put("/api/game/start").catch((err) => {
      throw new Error(err);
    });
  };

  const handleWhiteCard = (data) => {
    setWhiteCards((prev) => [...prev, ...data]);
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
      <GameBar game={game} player={player} actions={{ handleStartGame }} />
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
        {whiteCards.map((card) => (
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
