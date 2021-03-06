import React from "react";
import errorGIF from "../../assets/images/error.gif";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Cards Against</h1>
          <h2>Oh, shit!</h2>
          Something seems to have gone wrong with the client. Give it a cheeky
          refresh and cross your fingers it doesn't happen again.
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
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
