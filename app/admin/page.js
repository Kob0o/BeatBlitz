"use client";
import React, { useState } from "react";
import io from "socket.io-client";

const Admin = () => {
  const [playlistLink, setPlaylistLink] = useState("");
  const [numberOfPlayer, setNumberOfPlayer] = useState(2);
  const length = {
    numberOfPlayer: new Array(5),
  };

  const handleSubmit = () => {
    const link = extraireCodePlaylist(playlistLink);

    const socket = io("http://192.168.1.13:3002");
    console.log(numberOfPlayer)
    socket.emit("createGame", numberOfPlayer);

    socket.on("gameCreated", ({ gameId, teams }) => {
      window.location.href = `/admin/${gameId}/${link}`;
    });
  };

  const extraireCodePlaylist = (url) => {
    // Utiliser une expression régulière pour extraire le code de la playlist de l'URL
    const regex = /playlist\/(\w+)\?/;
    const match = url.match(regex);

    // Vérifier si le code de la playlist a été trouvé
    if (match && match[1]) {
      return match[1];
    } else {
      // Retourner null si le code n'a pas pu être extrait
      return null;
    }
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-primary to-secondary">
      <div className="flex flex-col items-center justify-center rounded-md h-1/2 w-1/2 p-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-6xl text-white">Beat Blitz</div>
          <div className="text-2xl text-white">Admin Page</div>
          <div className="text-white ">
            Choisissez le nombre de joueur :
            <select
              className="text-black bg-white rounded ml-4"
              onChange={(e) => setNumberOfPlayer(e.target.value)}
            >
              {Array.from(length.numberOfPlayer).map((x, i) => (
                <option key={i}>{i + 2}</option>
              ))}
            </select>
          </div>
          <p className="text-white text-center">
            Mettez le lien de la playlist:
            <input
              value={playlistLink}
              className="text-black rounded ml-4"
              type="text"
              size="50"
              onChange={(e) => setPlaylistLink(e.target.value)}
            />
          </p>
          <button
            onClick={handleSubmit}
            className="border-2 rounded-md p-2 border-white text-white"
          >
            Créer le jeu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
