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
      borderColor: "#dadada",
      padding: "8px 10px",
      marginRight: 8,
      transition: "all 0.2s ease-in-out",
      "&:focus": {
        borderColor: "#444444",
        boxShadow: "0 0 0 1px #444444",
      },
      "&:disabled": {
        backgroundColor: "#e8e8e8",
      },
    },
    "@media screen and (max-width: 640px)": {
      width: "100%",
      marginBottom: 8,
      "& input": {
        width: "100%",
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
