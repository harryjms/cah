import React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  Button: {
    backgroundColor: "black",
    "-webkit-appearance": "none",
    color: "white",
    padding: "8px 16px",
    font: "inherit",
    fontWeight: "bold",
    borderRadius: 8,
    outline: "none",
    "&:hover:not(:active):not(:disabled)": {
      opacity: 0.8,
      cursor: "pointer",
    },
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
    "&:disabled": {
      opacity: 0.7,
    },
    "@media screen and (max-width: 640px)": {
      width: "100%",
    },
  },
});

const Button = ({ children, ...props }) => {
  const classes = useStyles();
  return (
    <button {...props} className={classes.Button}>
      {children}
    </button>
  );
};
export default Button;
