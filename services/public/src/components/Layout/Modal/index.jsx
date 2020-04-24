import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  Modal: {
    width: "100%",
    maxWidth: 500,
    margin: "0 10px",
    backgroundColor: "white",
    borderRadius: 8,
    boxShadow: "-1px 0 5px 0 #c5c5c5",
    padding: 10,
  },
  title: { fontWeight: "bold", paddingBottom: 5 },
  body: {},
});

const Modal = ({ show, title, children, onDismiss }) => {
  const container = document.getElementById("modal");
  const classes = useStyles();

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  useEffect(() => {
    const listenForEsc = (e) => {
      if (e.keyCode === 27) {
        handleDismiss();
      }
    };

    container.addEventListener("click", handleDismiss);
    window.addEventListener("keyup", listenForEsc);
    const remove = () => {
      container.style.display = "none";
      window.removeEventListener("keyup", listenForEsc);
      container.removeEventListener("click", handleDismiss);
    };

    if (show) {
      container.style.display = "flex";
    } else {
      remove();
    }

    return remove;
  }, [show]);

  if (!show) {
    return null;
  }

  const modal = (
    <div className={classes.Modal}>
      {title && <div className={classes.title}>{title}</div>}
      <div className={classes.body}>{children}</div>
    </div>
  );

  return createPortal(modal, container);
};

export default Modal;
