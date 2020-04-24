import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { createUseStyles } from "react-jss";
import Title from "../Title";
import gif from "../../../assets/images/loader.gif";

const FSLoading = ({ children }) => {
  const container = document.getElementById("fs-load");

  useEffect(() => {
    container.classList.add("show");
    return () => {
      container.classList.remove("show");
    };
  }, []);

  return createPortal(
    <div style={{ textAlign: "center" }}>
      <Title />
      <img src={gif} />
      <br />
      {children}
    </div>,
    container
  );
};

const useStyles = createUseStyles({
  Loading: {
    display: "inline-flex",
    alignItems: "center",
    "& svg": {
      animationName: "$spin",
      animationDuration: "0.8s",
      animationTimingFunction: "linear",
      animationIterationCount: "infinite",
    },
    "& svg circle": {
      stroke: "currentColor",
    },
  },
  "@keyframes spin": {
    from: {
      transform: "rotate(0deg)",
    },
    to: {
      transform: "rotate(360deg)",
    },
  },
});

const Loading = ({ children, size = 32, fullScreen }) => {
  if (fullScreen) {
    return <FSLoading>{children}</FSLoading>;
  }

  const classes = useStyles();
  return (
    <div className={classes.Loading}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
      >
        <circle
          cx="50"
          cy="50"
          fill="none"
          strokeWidth="10"
          r="35"
          strokeDasharray="164.93361431346415 56.97787143782138"
          transform="matrix(1,0,0,1,0,0)"
        />
      </svg>
      {children}
    </div>
  );
};
export default Loading;
