import React, { createContext, useContext, useState } from "react";
import { createUseStyles } from "react-jss";

const RailContext = createContext();
export const useRail = () => useContext(RailContext);

const useStyles = createUseStyles({
  Rail: {
    display: "flex",
    marginBottom: 20,
    overflowX: "auto",
    whiteSpace: "nowrap",
  },
});

const Rail = ({ children }) => {
  const [selected, setSelected] = useState([]);
  const classes = useStyles();

  const toggleSelected = (card) => {
    const newArray = [...selected];
    if (selected.includes(card)) {
      newArray.splice(newArray.indexOf(card), 1);
    } else {
      newArray.push(card);
    }
    setSelected(newArray);
  };

  return (
    <div className={classes.Rail}>
      <RailContext.Provider value={{ selected, toggleSelected }}>
        {children}
      </RailContext.Provider>
    </div>
  );
};
export default Rail;
