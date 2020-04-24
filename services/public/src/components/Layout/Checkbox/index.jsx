import React from "react";
import { createUseStyles } from "react-jss";
import { v4 } from "uuid";

const useStyles = createUseStyles({
  CheckBox: {
    "& label": {
      marginLeft: 10,
    },
  },
});

const Checkbox = ({ label, value, checked, onChange, ...props }) => {
  const classes = useStyles();
  const uuid = v4();
  return (
    <div className={classes.CheckBox}>
      <input
        type="checkbox"
        value={value}
        checked={checked}
        onChange={onChange}
        {...props}
        id={uuid}
      />
      {label && <label htmlFor={uuid}>{label}</label>}
    </div>
  );
};

export default Checkbox;
