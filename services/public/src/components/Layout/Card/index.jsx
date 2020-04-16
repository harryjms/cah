import React from "react";
import { createUseStyles } from "react-jss";
import { useRail } from "../Rail";

const useStyles = createUseStyles((theme) => ({
  card: {
    position: "relative",
    minWidth: 200,
    width: 200,
    height: 296.2962962,
    fontWeight: "bold",
    fontSize: "16pt",
    whiteSpace: "normal",
    position: "relative",
    perspective: 1000,
    transition: "margin-top 0.2s ease-in-out",
    userSelect: "none",
    [theme.mediaQuery.iPhone8]: {
      width: 150,
      minWidth: 150,
      height: 222.22222215,
      fontSize: "13pt",
    },
    "&:last-child": {
      marginRight: 20,
    },
    "& img": {
      display: "block",
      opacity: 0,
    },
    "&:not(:first-child)": {
      marginLeft: 20,
    },
    "& .inner": {
      position: "relative",
      width: "100%",
      height: "100%",
      transition: "transform 0.8s",
      transformStyle: "preserve-3d",
    },
    "&.flip": {
      "& .inner": {
        transform: "rotateY(180deg)",
      },
    },
    "& .front, & .back": {
      position: "absolute",
      width: "100%",
      height: "100%",
      backfaceVisibility: "hidden",
      display: "flex",
      flexFlow: "column",
      padding: 10,
      borderRadius: 10,
      borderWidth: 2,
      borderStyle: "solid",
      borderColor: "transparent",
      boxShadow: "-1px 0 5px 0 #c5c5c5",
    },

    "& .back": {
      transform: "rotateY(180deg)",
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
    [theme.mediaQuery.iPhone8]: {
      fontSize: "8pt",
    },
  },
  black: {
    "& .front, & .back": {
      backgroundColor: "black",
      color: "white",
    },
  },
  white: (props) => ({
    "& .front, & .back": {
      backgroundColor: "white",
    },
    "& .front": {
      cursor: props.selectable && "pointer",
    },
  }),
  selected: {
    "& .front, & .back": {
      borderColor: "rgba(10,132,255)",
    },
    marginTop: -20,
  },
}));

const Card = ({
  children,
  colour,
  pick = 1,
  hideValue = false,
  innerRef,
  onClick,
  selected,
  cardNumber,
  style,
}) => {
  let selectable = typeof onClick === "function";
  const classes = useStyles({ selectable });

  return (
    <div
      className={[
        classes.card,
        colour === "black" ? classes.black : classes.white,
        selected && classes.selected,
        hideValue && "flip",
      ]
        .filter((a) => a)
        .join(" ")}
      onClick={onClick}
      ref={innerRef}
      style={style}
    >
      <div className="inner">
        <div className="front">
          <div
            className={classes.content}
            dangerouslySetInnerHTML={{ __html: children }}
          />
          <div className={classes.footer}>
            <div className="name">Cards Against</div>
            {(pick > 1 || cardNumber) &&
              (colour === "black" ? (
                <div className="pick">Pick {pick}</div>
              ) : (
                <div className="pick">{cardNumber}</div>
              ))}
          </div>
        </div>
        <div className="back">Cards Against</div>
      </div>
    </div>
  );
};

export default Card;
