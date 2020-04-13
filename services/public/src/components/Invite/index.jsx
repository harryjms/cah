import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode.react";
import TextField from "../TextField";

const Invite = ({ code, onDismiss }) => {
  const [show, setShow] = useState(true);
  const container = document.getElementById("fs-load");

  useEffect(() => {
    container.classList.add("show");
    return () => {
      container.classList.remove("show");
    };
  }, []);
  return createPortal(
    <div>
      <h3>via Link</h3>
      <TextField
        value={`http://${location.host}/join/${code}`}
        readOnly
        onChange={() => {}}
      />
      <br />
      <br />
      <h3>via QR Code</h3>
      <QRCode value={`http://${location.host}/join/${code}`} />
      <br />
      <button onClick={() => onDismiss()}>Done</button>
    </div>,
    container
  );
};

export default Invite;
