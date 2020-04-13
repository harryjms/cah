import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode.react";

const Invite = ({ code }) => {
  const container = document.getElementById("fs-load");

  useEffect(() => {
    container.classList.add("show");
    return () => {
      container.classList.remove("show");
    };
  }, []);
  console.log(location);
  return createPortal(
    <div>
      <QRCode value={`http://${location.host}/join/${code}`} />
    </div>,
    container
  );
};

export default Invite;
