import React from "react";
import { createUseStyles } from "react-jss";
import { useRail } from "../Rail";

const useStyles = createUseStyles({
  card: {
    display: "flex",
    flexFlow: "column",
    minWidth: 200,
    width: 200,
    height: 296.2962962,
    padding: 10,
    fontWeight: "bold",
    fontSize: "16pt",
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "transparent",
    whiteSpace: "normal",
    "& img": {
      display: "block",
      opacity: 0,
    },
    position: "relative",
    "&:not(:first-child)": {
      marginLeft: 20,
    },
  },
  content: {
    flex: 1,
  },
  footer: {
    fontSize: "10pt",
    display: "flex",
    "& .name": {
      flex: 1,
    },
    "& .pick": {
      textAlign: "right",
      textTransform: "uppercase",
    },
  },
  black: {
    backgroundColor: "black",
    color: "white",
  },
  white: {
    backgroundColor: "white",
  },
  selected: {
    borderColor: "rgba(10,132,255)",
  },
});

const Card = ({ children, colour, pick = 1, hideValue = false }) => {
  const classes = useStyles();
  const { selected, toggleSelected } = useRail();

  const handleSelect = () => {
    if (colour !== "black") {
      toggleSelected(children);
    }
  };

  return (
    <div
      className={[
        classes.card,
        colour === "black" ? classes.black : classes.white,
        selected.includes(children) && classes.selected,
      ]
        .filter((a) => a)
        .join(" ")}
      onClick={handleSelect}
    >
      <div className={classes.content}>{children}</div>
      <div className={classes.footer}>
        <div className="name">Cards Against</div>
        {pick > 1 && colour === "black" && (
          <div className="pick">Pick {pick}</div>
        )}
      </div>
    </div>
  );
};

export default Card;
