import React, { useEffect } from "react";
import { withRouter } from "react-router-dom";
import axios from "axios";
import loaderGif from "../../assets/images/loader.gif";

const NewGame = ({ history }) => {
  useEffect(() => {
    const generate = async () => {
      try {
        const { data } = await axios.post("/api/game/new");
        history.push("/join/" + data._id);
      } catch (error) {
        alert("An error occured.");
        console.error(error);
      }
    };
    generate();
  }, []);

  return (
    <div>
      <h1>Cards Against Hummanity</h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>
          <img src={loaderGif} />
          <br />
          Generating Game...
        </div>
      </div>
    </div>
  );
};

export default withRouter(NewGame);
