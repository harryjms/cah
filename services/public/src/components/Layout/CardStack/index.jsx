import React, { createRef, useLayoutEffect, useState } from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  CardStack: {
    position: "relative",
    marginLeft: 10,
    marginRight: 10,
    transition: "width 0.2s ease-in-out",
  },
  Card: {
    display: "inline-block",
    position: "absolute",
    boxShadow: "-1px 0 5px 0 #c5c5c5",
    borderRadius: 10,
    transition: "left 0.2s ease-in-out",
  },
});

const CardStack = ({ children, spread = false, onClick }) => {
  const [cardWidth, setCardWidth] = useState(0);
  const classes = useStyles();
  const cardRef = createRef();
  const stackRef = createRef();

  useLayoutEffect(() => {
    if (stackRef.current && cardRef.current) {
      const cardWidth = cardRef.current.clientWidth;
      let stackWidth = cardWidth + 30 * (children.length - 1) + "px";
      if (spread) {
        stackWidth =
          cardWidth * children.length + 5 * (children.length - 1) + "px";
      }
      stackRef.current.style.width = stackWidth;
      stackRef.current.style.minWidth = stackWidth;
      setCardWidth(cardWidth);
    }
  }, [children, spread]);

  return (
    <div className={classes.CardStack} ref={stackRef} onClick={onClick}>
      {children.map((child, i) => (
        <div
          key={i}
          className={classes.Card}
          style={{
            left: spread ? (cardWidth + 5) * i : 30 * i,
          }}
        >
          {React.cloneElement(child, { innerRef: i === 0 ? cardRef : null })}
        </div>
      ))}
    </div>
  );
};

export default CardStack;
