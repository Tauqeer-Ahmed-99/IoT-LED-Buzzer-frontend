import "./App.css";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const origin = window.location.origin
  .split(":")
  .filter((_, index) => index < 2)
  .join(":");

const url = `${origin}:5080/led-status`;

console.log(url);

function App() {
  const [socket, setSocket] = useState(null);
  const [ledStatus, setLedStatus] = useState("off");

  const getLedStatus = async () => {
    try {
      const res = await fetch(url);
      const parsedResponse = await res.json();
      if (parsedResponse.ledStatus === "on") {
        setLedStatus("on");
      } else {
        setLedStatus("off");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const postLedStatus = async (ledStatus) => {
    try {
      const body = { ledStatus };

      const res = await fetch(url, {
        body: JSON.stringify(body),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const parsedResponse = await res.json();
      if (parsedResponse.ledStatus === "on") {
        setLedStatus("on");
      } else {
        setLedStatus("off");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let sio;
    if (!socket) {
      try {
        sio = io(`${origin}:5080`);
        setSocket(sio);
        sio.on("connection", (s) => {
          console.log(s);
          console.log("connected to server");
        });
      } catch (error) {
        console.log(error);
      }
    }

    getLedStatus();

    sio.on("ledStatus", (ledStatus) => {
      setLedStatus(ledStatus);
    });

    return () => {
      sio?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <h3>LED Status : {ledStatus.toUpperCase()}</h3>
      <button onClick={() => postLedStatus(ledStatus === "on" ? "off" : "on")}>
        Turn {ledStatus === "on" ? "Off" : "On"}
      </button>
    </div>
  );
}

export default App;
