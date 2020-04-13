import React from "react";
import errorGIF from "../../assets/images/404.gif";
const Error404 = () => {
  return (
    <div>
      <h1>Cards Against</h1>
      <h2>Errrmmm...</h2>
      How the fuck did you get here? Nothing to see here. Nothing. Nada. Piss
      off.
      <br />
      <img
        src={errorGIF}
        style={{
          display: "block",
          margin: "0 auto",
          marginTop: 50,
          borderRadius: 10,
        }}
      />
    </div>
  );
};

export default Error404;
