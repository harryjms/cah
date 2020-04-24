import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import axios from "axios";
import useCookies from "react-cookie";
import Button from "../Layout/Button";
import Loading from "../Layout/Loading";
import Invite from "../Layout/Invite";
import { useGameContext } from "./index";
import Modal from "../Layout/Modal";
import Players from "./Players";

const useStyles = createUseStyles({
  GameBar: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    "& .content": {
      display: "flex",
      alignItems: "center",
    },
    "& .buttons": {
      display: "flex",
      whiteSpace: "nowrap",
      alignItems: "center",
      "& .status": {
        marginRight: 5,
      },
      "& button": {
        marginRight: 5,
      },
    },
    "& h2": {
      margin: 0,
      textOverflow: "elipsis",
      whiteSpace: "nowrap",
      width: "100%",
      "& span": {
        fontWeight: "normal",
        fontSize: "0.8em",
        marginLeft: 10,
      },
    },
    "& button": {
      alignSelf: "flex-end",
    },
  },
  players: {
    "&:hover": {
      textDecoration: "underline",
      cursor: "pointer",
    },
  },
});

const GameBar = () => {
  const { game, player, allPlayers } = useGameContext();
  const classes = useStyles();
  const [showInvite, setShowInvite] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);
  const isHost = game && player && game.host === player.name;

  const handleInvite = () => {
    setShowInvite((prev) => !prev);
  };

  const handleEnd = () => {
    axios.get("/api/game/end").catch((err) => {
      throw new Error(err);
    });
  };

  const handleStartGame = () => {
    axios.put("/api/game/start").catch((err) => {
      throw new Error(err);
    });
  };

  return (
    <div className={classes.GameBar}>
      {/* {showInvite && <Invite code={game._id} onDismiss={handleInvite} />} */}
      <div className="content">
        <h2>
          {game.name}{" "}
          <span
            className={classes.players}
            onClick={() => setShowPlayers(true)}
          >
            {allPlayers.length} {allPlayers.length === 1 ? "Player" : "Players"}
          </span>
        </h2>
        <div className="buttons">
          <div className="status">
            {game.gameState === "IDLE" ? (
              <Loading>
                {allPlayers.length < 2
                  ? "Waiting for more players... "
                  : "Waiting for game to start..."}
              </Loading>
            ) : (
              player.state === "CZAR" && (
                <div
                  style={{ fontSize: "20pt", marginRight: 5 }}
                  title="You will choose the winning combination this round."
                >
                  👑
                </div>
              )
            )}
          </div>
          {isHost &&
            (game.gameState === "IDLE" ? (
              <Button
                onClick={handleStartGame}
                disabled={allPlayers.length < 2}
              >
                Start Game
              </Button>
            ) : (
              <Button onClick={handleEnd}>End Game</Button>
            ))}
          {game.gameState === "IDLE" && (
            <Button style={{ width: "auto" }} onClick={handleInvite}>
              Invite
            </Button>
          )}
        </div>
      </div>
      <Modal title="Players" show={showPlayers}>
        <Players onDismiss={() => setShowPlayers(false)} />
      </Modal>
      <Modal title="Invite" show={showInvite}>
        <Invite code={game._id} onDismiss={() => setShowInvite(false)} />
      </Modal>
    </div>
  );
};

export default GameBar;
