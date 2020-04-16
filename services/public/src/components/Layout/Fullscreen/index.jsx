import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  Fullscreen: {
    position: "fixed",
    display: "flex",
    alignItems: "center",

    backgroundColor: "#d4d4d4",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 99999999,
  },
});
const Fullscreen = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.Fullscreen}>{children}</div>;
};
export default Fullscreen;
