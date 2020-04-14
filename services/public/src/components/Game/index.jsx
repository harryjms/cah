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
  const [player, setPlayer] = useState({});
  const [game, setGame] = useState(null);
  const [whiteCards, setWhiteCards] = useState([]);
  const isHost = game && player && game.host === player.name;

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
    let socket;
    if (player && player.game) {
      socket = new Socket();
      socket.on("disconnect", handleDisconnection);
      socket.on("reconnect", () => {
        socket.emit("GetGame");
        handleReconnection();
      });

      socket.on("GameData", handleGameData);
      socket.on("Notification", handleNotification);
      socket.on("PlayerData", handlePlayerData);

      socket.emit("GetGame");
    }
    return () => {
      socket = null;
    };
  }, [player.game]);

  const handleGameData = (data) => {
    setGame(data);
    console.log("GameData", data);
    if (loading) {
      setLoading(false);
    }
  };

  const handlePlayerData = (data) => {
    setPlayer(data);
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

  const deck = () => {
    const { gameState, host } = game;
    switch (gameState) {
      case "READING":
        return <PlayedCards cards={game.currentRound.whiteCards} />;
      case "SELECTING":
        return null;
    }
  };

  return (
    <>
      {loading && <Loading fullScreen>Loading Game...</Loading>}
      {game && (
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
          {player.hand && (
            <Rail selectable>
              {player.hand.map((card) => (
                <Card colour="white" key={card}>
                  {card}
                </Card>
              ))}
            </Rail>
          )}
          {notifications.map((not) => (
            <Notification key={not} show>
              {not}
            </Notification>
          ))}
        </>
      )}
      {connectionLost && (
        <Loading fullScreen>Reconnecting to server...</Loading>
      )}
    </>
  );
};

export default withRouter(Game);
