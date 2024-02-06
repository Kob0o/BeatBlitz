"use client";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./style.css";

const BuzzerId = ({ params }) => {
  let id = params.id;
  let teamName = params.teamname;
  const [gameInfo, setGameInfo] = useState(null);
  const [isBuzzed, setIsBuzzed] = useState(false);

  const socket = io("http://192.168.1.13:3002");

  useEffect(() => {
    socket.emit("joinRoom", id);

    socket.on("gameInfo", (gameInfo) => {
      setGameInfo(gameInfo);
      setIsBuzzed(gameInfo.isBuzzed);
    });
  }, []);

  const handleBuzz = () => {
    socket.emit("buzzer", { id, teamName });
  };

  console.log(gameInfo);

  return (
    <div className="flex flex-col  h-screen bg-gradient-to-r from-primary to-secondary gap-4">
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="purples">{teamName}</div>{" "}
        <div className="text-white font-sans">Code de partie : {id}</div>
        {isBuzzed ? (
          <button
            className="rounded-full w-64 h-64 border-4 border-white bg-white hover:border-2"
          ></button>
        ) : (
          <button
            className="rounded-full w-64 h-64 border-4 border-white bg-red hover:border-2"
            onClick={handleBuzz}
          ></button>
        )}
      </div>
    </div>
  );
};

export default BuzzerId;
