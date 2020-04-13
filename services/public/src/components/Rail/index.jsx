import React, { createContext, useContext, useState } from "react";
import { createUseStyles } from "react-jss";

const RailContext = createContext();
export const useRail = () => useContext(RailContext);

const useStyles = createUseStyles((theme) => ({
  Rail: {
    display: "flex",

    overflowX: "auto",
    whiteSpace: "nowrap",
    padding: 20,
  },
}));

const Rail = ({ children, selectable = false }) => {
  const [selected, setSelected] = useState([]);
  const classes = useStyles();

  const toggleSelected = (card) => {
    if (selectable) {
      const newArray = [...selected];
      if (selected.includes(card)) {
        newArray.splice(newArray.indexOf(card), 1);
      } else {
        newArray.push(card);
      }
      setSelected(newArray);
    }
  };

  return (
    <div className={classes.Rail}>
      <RailContext.Provider value={{ selected, toggleSelected, selectable }}>
        {children}
      </RailContext.Provider>
    </div>
  );
};
export default Rail;
