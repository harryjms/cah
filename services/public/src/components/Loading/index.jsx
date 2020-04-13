import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import Title from "../Title";
import gif from "../../assets/images/loader.gif";

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

const Loading = ({ children, fullScreen }) => {
  if (fullScreen) {
    return <FSLoading>{children}</FSLoading>;
  }
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img src={gif} style={{ width: 32 }} />
      {children}
    </div>
  );
};
export default Loading;
