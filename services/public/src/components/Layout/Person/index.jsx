import React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  Person: {
    display: "inline-block",
    width: 32,
    height: 32,
    lineHeight: "32px",
    textAlign: "center",
    borderRadius: "50%",
    backgroundColor: "#b148b1",
    color: "white",
  },
});
const Person = ({ name = "?" }) => {
  const classes = useStyles();
  return <div className={classes.Person}>{name[0]}</div>;
};
export default Person;
