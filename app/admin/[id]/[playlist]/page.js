"use client";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const Admin = ({ params }) => {
  let id = params.id;
  let playlist = params.playlist;
  const [data, setData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [isBuzzed, setIsBuzzed] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [teamWhoBuzzed, setTeamWhoBuzzed] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const socket = io("http://192.168.1.13:3002");

  const handleStop = () => {
    setIsModalOpen(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    const audioElement = document.getElementById("audioPlayer");

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
  };

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  const handleReset = () => {
    setCurrentTrackIndex(0);

    socket.emit("resetGame", id);
  };

  const handleNextTrack = () => {
    if (data && currentTrackIndex < data.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const handleScoreUpdate = (teamName) => {
    setCurrentTrackIndex(currentTrackIndex + 1);
    setTeamWhoBuzzed(null);
    socket.emit("updateScore", { id, teamName, score: 1 });
  };

  const handleFollowGame = () => {
    setTeamWhoBuzzed(null);
    socket.emit("followGame", id);
  };

  useEffect(() => {
    socket.emit("joinRoom", id);

    //Réception de la réponse du serveur
    //On assigne les équipes à la variable teams
    socket.on("gameInfo", (gameInfo) => {
      setTeams(gameInfo.teams);
      setIsBuzzed(gameInfo.isBuzzed);
    });

    socket.on("buzzed", (teamName) => {
      setTeamWhoBuzzed(teamName);
      console.log(`L'équipe ${teamName} a buzzé`);
    });

    fetch(`http://localhost:8888/spotify/tracks/${playlist}`)
      .then((response) => response.json())
      .then((data) => {
        setData(data.tracks);
      })
      .catch((error) => {
        console.error(
          "Erreur lors du chargement des données de musique",
          error
        );
      });
  }, []);

  return (
    <div className="flex min-h-screen min-w-screen bg-gradient-to-r from-primary to-secondary">
      {/* Sidebar pour les équipes */}
      <div className="w-96 flex-shrink-0 border-r border-white">
        <h1 className="text-center text-white font-bold py-2 px-4 mb-12 text-2xl">
          Equipes
        </h1>
        <ul className="text-white m-6 text-lg space-y-6 ">
          {teams.map((team) => (
            <li key={team.name}>
              {team.name} - Score : {team.score}
              {teamWhoBuzzed == team.name ? (
                <div>
                  <button
                    className="border-2 border-white px-2 rounded-md ml-2"
                    onClick={() => handleScoreUpdate(team.name)}
                    key={team.name}
                  >
                    +
                  </button>
                  <button
                    className="border-2 border-white px-2 rounded-md ml-2"
                    onClick={() => handleFollowGame()}
                    key={team.name}
                  >
                    {">>"}
                  </button>
                </div>
              ) : (
                <div></div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        <p className="text-white text-2xl font-bold my-4 text-center">
          ID : {id}
        </p>
        {data && data.length > 0 && (
          <div>
            <img
              className="w-96 h-96 mx-auto mb-8 rounded-md shadow-xl"
              src={data[currentTrackIndex].imageUrl}
              alt="Pochette de l'album"
            />
            <h2 className="text-md font-bold text-center text-white">
              Titre : {data[currentTrackIndex].title}
            </h2>
            <p className="text-md text-center text-white">
              Artiste : {data[currentTrackIndex].author}
            </p>
            <div className="flex justify-center mt-8">
              <audio controls src={data[currentTrackIndex].preview_url}></audio>
            </div>
          </div>
        )}

        {/* Boutons */}
        <div className="mt-48 flex justify-around w-full">
          <button
            onClick={handleStop}
            className="border-2 rounded-md p-2 border-white text-white"
          >
            Stop
          </button>
          <button
            onClick={handleNextTrack}
            className="border-2 rounded-md p-2 border-white text-white"
          >
            Piste Suivante
          </button>
          <button
            onClick={handleReset}
            className="border-2 rounded-md p-2 border-white text-white"
          >
            Reset
          </button>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-center text-lg font-bold mb-4">
              Fin de partie ! Bravo aux vainqeurs
            </h2>
            <h2 className="text-center text-lg font-bold mb-4">
              Classement des Équipes
            </h2>
            <ul className="mb-4 space-y-6">
              {sortedTeams.map((team) => (
                <li key={team.name}>
                  {team.name} - Score: {team.score}
                </li>
              ))}
            </ul>
            <button
              className="text-lg font-bold mb-4"
              onClick={() => setIsModalOpen(false)}
            >
              Retour
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Admin;
