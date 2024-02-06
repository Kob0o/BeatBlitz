"use client";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const Buzzer = () => {
  const [id, setId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleJoin = () => {
    //Envoi de l'ID de la partie au serveur
    const socket = io("http://192.168.1.13:3002");
    socket.emit("joinGame", id);

    //Réception de la réponse du serveur
    socket.on("joinedGame", ({ gameId, teamName }) => {
      window.location.href = `/buzzer/${gameId}/${teamName}`;
    });

    socket.on("gameNotFound", (id) => {
      setErrorMessage(`La partie ${id} n'existe pas`);
    });

    socket.on("maxPlayersReached", (id) => {
      setErrorMessage(`La partie ${id} est pleine`);
    });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-primary to-secondary">
      <div className="flex flex-col gap-4">
        <h1 className="text-white font-bold text-xl text-center">
          Buzzer
        </h1>
        {errorMessage ? (
          <p className="text-white text-center">Erreur : {errorMessage}</p>
        ) : (
          <p></p>
        )}
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="border-2 border-black rounded-md p-2"
        />
        <button
          onClick={handleJoin}
          className="border-2 rounded-md p-2 border-white text-white"
        >
          Rejoindre la partie
        </button>
      </div>
    </div>
  );
};

export default Buzzer;
