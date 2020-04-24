import React from "react";
import { createUseStyles } from "react-jss";
import Loading from "../Loading";

const useStyles = createUseStyles({
  Button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
    "-webkit-appearance": "none",
    color: "white",
    padding: "8px 16px",
    font: "inherit",
    fontWeight: "bold",
    borderRadius: 8,
    outline: "none",
    transition: "all 0.2s ease-in-out",
    "&:hover:not(:active):not(:disabled)": {
      backgroundColor: "#3a3a3a",
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

const Button = ({ children, processing, disabled, ...props }) => {
  const classes = useStyles();
  return (
    <button
      disabled={disabled || processing}
      {...props}
      className={classes.Button}
    >
      {processing ? <Loading size={20} /> : children}
    </button>
  );
};
export default Button;
