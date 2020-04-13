import React from "react";
import { createUseStyles } from "react-jss";
const useStyles = createUseStyles({
  Stack: {
    display: "flex",
    "@media screen and (max-width: 640px)": {
      flexFlow: "column !important",
      alignItems: "flex-start !important",
    },
  },
  HStack: {
    flexFlow: "row",
    alignItems: "flex-end",
  },
  VStack: {
    flexFlow: "column",
  },
});
export const HStack = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.Stack + " " + classes.HStack}>{children}</div>;
};
export const VStack = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.Stack + " " + classes.VStack}>{children}</div>;
};
