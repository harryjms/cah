import React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  Banner: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgb(10,132,255)",
    color: "white",
    margin: "15px 0",
    "&.red": {
      backgroundColor: "rgb(255,69,58)",
    },
  },
});
const Banner = ({ children, colour = "white" }) => {
  const classes = useStyles();
  const combineClasses = (array) => array.filter((a) => a).join(" ");
  return (
    <div
      className={combineClasses([classes.Banner, colour === "red" && "red"])}
    >
      {children}
    </div>
  );
};

export default Banner;
