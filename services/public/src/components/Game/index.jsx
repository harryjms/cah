import React, { useState, useEffect, createContext, useContext } from "react";
import { createUseStyles } from "react-jss";
import Rail from "../Layout/Rail";
import Card from "../Layout/Card";
import { withRouter } from "react-router-dom";
import Loading from "../Layout/Loading";
import PlayedCards from "./PlayedCards";
import axios from "axios";
import Notification from "../Layout/Notification";
import WhiteCards from "./WhiteCards";
import GameBar from "./GameBar";
import Socket from "../../helpers/socket";
import Button from "../Layout/Button";

const GameContext = createContext();
export const useGameContext = () => useContext(GameContext);

const useStyles = createUseStyles({
  ConfirmButton: {
    position: "fixed",
    bottom: 10,
    left: 10,
    right: 10,
    textAlign: "center",
    zIndex: 999,
  },
});

const Game = ({ history }) => {
  // State: The Game
  const [player, setPlayer] = useState({});
  const [game, setGame] = useState(null);
  const [handSelection, setHandSelection] = useState([]);

  // States: UI
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [connectionLost, setConnectionLost] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    const getPlayer = async () => {
      try {
        const { data } = await axios.get("/api/me");
        setPlayer(data);
      } catch (err) {
        history.push("/");
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
    console.log("PlayerData", player);
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

  const deck = () => {
    const { gameState, host } = game;
    switch (gameState) {
      case "READING":
        return <PlayedCards cards={game.currentRound.whiteCards} />;
      case "SELECTING":
        return (
          handSelection.length === game.currentRound.blackCard.pick && (
            <div className={classes.ConfirmButton}>
              <Button>Confirm Selection</Button>
            </div>
          )
        );
    }
  };

  const handleHandSelection = (card) => {
    const { pick } = game.currentRound.blackCard;
    let newArray = [...handSelection];
    if (handSelection.includes(card)) {
      newArray.splice(handSelection.indexOf(card), 1);
    } else if (pick === 1) {
      newArray = [card];
    } else if (handSelection.length < pick) {
      newArray.push(card);
    }
    setHandSelection(newArray);
  };

  return (
    <GameContext.Provider
      value={{ game, player, handSelection, handleHandSelection }}
    >
      {loading && <Loading fullScreen>Loading Game...</Loading>}
      {game && (
        <>
          <GameBar />
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
          <WhiteCards />
          {notifications.map((not, i) => (
            <Notification key={i} show>
              {not}
            </Notification>
          ))}
        </>
      )}
      {connectionLost && (
        <Loading fullScreen>Reconnecting to server...</Loading>
      )}
    </GameContext.Provider>
  );
};

export default withRouter(Game);
