import socketio from "socket.io-client";

class Socket {
  constructor() {
    this.socket = socketio("/");
    return this.socket;
  }
}

export default Socket;
