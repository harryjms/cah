import React, { createRef, useLayoutEffect, useState } from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  CardStack: {
    position: "relative",
    marginLeft: 10,
    marginRight: 10,
  },
  Card: {
    position: "absolute",
    boxShadow: "-1px 0 5px 0 #c5c5c5",
    borderRadius: 10,
  },
});

const CardStack = ({ children }) => {
  const [stackWidth, setStackWidth] = useState();
  const classes = useStyles();
  const cardRef = createRef();
  const stackRef = createRef();

  useLayoutEffect(() => {
    if (stackRef.current && cardRef.current) {
      const cardWidth = cardRef.current.clientWidth;
      const stackWidth = cardWidth + 30 * (children.length - 1) + "px";
      stackRef.current.style.width = stackWidth;
      stackRef.current.style.minWidth = stackWidth;
      console.log(cardWidth);
    }
  }, [children]);
  return (
    <div className={classes.CardStack} ref={stackRef}>
      {children.map((child, i) => (
        <div key={i} className={classes.Card} style={{ left: 30 * i }}>
          {React.cloneElement(child, { innerRef: i === 0 ? cardRef : null })}
        </div>
      ))}
    </div>
  );
};

export default CardStack;
