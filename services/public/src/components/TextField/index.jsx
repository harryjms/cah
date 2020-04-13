import React from "react";
import { VStack } from "../Stack";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  TextField: {
    "& input": {
      font: "inherit",
      borderRadius: 8,
      "-webkit-appearance": "none",
      outline: "none",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "#444444",
      padding: "8px 10px",
      "&:focus": {
        boxShadow: "0 0 0 1px #444444",
      },
    },
  },
  Label: {
    display: "block",
    marginBottom: 4,
  },
});

const TextField = ({ label, value, onChange, ...props }) => {
  const classes = useStyles();
  return (
    <div className={classes.TextField}>
      <VStack>
        {label && <label className={classes.Label}>{label}</label>}
        <input type="text" value={value} onChange={onChange} {...props} />
      </VStack>
    </div>
  );
};

export default TextField;
