import React from "react";
import { createUseStyles } from "react-jss";
import Fullscreen from "../Layout/Fullscreen";
import Title from "../Layout/Title";
import Button from "../Layout/Button";

const useStyles = createUseStyles({
  EndScreen: {
    width: "100%",
    padding: 20,
    textAlign: "center",
  },
});

const EndScreen = () => {
  const classes = useStyles();
  return (
    <Fullscreen>
      <div className={classes.EndScreen}>
        <Title />
        The game has now ended.
        <br />
        <Button
          onClick={() => (window.location = "/")}
          style={{ width: "auto", marginTop: 20 }}
        >
          Start a new game
        </Button>
      </div>
    </Fullscreen>
  );
};
export default EndScreen;
