import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  Notification: (props) => ({
    padding: "5px 10px",
    marginBottom: 5,
    borderRadius: 10,
    backgroundColor: "rgba(72,72,74,1)",
    color: "white",
    pointerEvent: "none",
    opacity: props.show ? 1 : 0,
    transition: "opacity 1s ease-in-out",
  }),
});

const Notification = ({ children, show }) => {
  const classes = useStyles({ show });
  const container = document.getElementById("notification");
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    let timer = setTimeout(() => {
      if (show) {
        setVisible(false);
      }
    }, 5000);
    return () => {
      clearTimeout(timer);
    };
  }, [show]);

  return createPortal(
    <div
      className={[classes.Notification].filter((a) => a).join(" ")}
      style={{ display: visible ? "block" : "none" }}
    >
      {children}
    </div>,
    container
  );
};
export default Notification;
