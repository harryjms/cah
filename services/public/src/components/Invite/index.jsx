import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode.react";
import TextField from "../TextField";
import Button from "../Button";

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
    <div
      style={{
        width: "100%",
        maxWidth: 500,
        textAlign: "center",
        padding: 20,
      }}
    >
      <h3>via Link</h3>
      <TextField
        value={`http://${location.host}/join/${code}`}
        onFocus={(e) => e.target.select()}
        onChange={() => {}}
      />
      <br />

      <h3>via QR Code</h3>
      <QRCode value={`http://${location.host}/join/${code}`} />
      <br />
      <Button onClick={() => onDismiss()} style={{ marginTop: 30 }}>
        Done
      </Button>
    </div>,
    container
  );
};

export default Invite;
