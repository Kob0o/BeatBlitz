"use client";

import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import io from "socket.io-client";

const GameMaster = ({ params }) => {
  let id = params.id;
  const [teams, setTeams] = useState([]);
  const [nbr, setNbr] = useState(0);
  const [showTeam, setShowTeam] = useState(null);
  const [isBuzzed, setIsBuzzed] = useState(false);
  const [teamName, setTeamName] = useState(null);
  const [timer, setTimer] = useState(5);


  const displayFirst = (teamName) => {
    setShowTeam(
      <div className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50">
        <div className="bg-white p-10 rounded-lg">
          <p className="text-4xl font-bold text-center">{teamName} a buzzé !</p>
        </div>
      </div>
    );
    // On affiche une div avec le nom de l'équipe qui a buzzé en grand
  };
  useEffect(() => {
    const socket = io("http://192.168.1.13:3002");

    socket.emit("joinRoom", id);

    socket.on("gameInfo", (gameInfo) => {
      setIsBuzzed(gameInfo.isBuzzed);
      setTeams(gameInfo.teams);
    });

    socket.on("buzzed", (teamName) => {
      setTeamName(teamName);
    });
    let interval;

    if (isBuzzed && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isBuzzed, timer]);

  return (
    <div className="flex flex-col flex-wrap align-center justify-center gap-4 h-screen bg-gradient-to-r from-primary to-secondary">
      <h1 className="text-white text-2xl underline text-center">
        ID de la salle : {id}{" "}
      </h1>
      <h2 className="text-white text-xl text-center">
        Nombre d'équipes : {nbr}{" "}
      </h2>
      <div className="flex justify-center align-center flex-wrap">
        {teams.map((team, index) => (
          <div
            key={index}
            className="border-2 border-white rounded-xl h-fit w-fit m-2"
          >
            <p className="text-white text-center mx-5 my-2">{team.name}</p>
            <p className="text-white text-center mx-5 my-2">
              Score : {team.score}
            </p>
          </div>
        ))}
      </div>
      {isBuzzed ? (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50">
          <div className="bg-white p-10 rounded-lg">
            <p className="text-4xl font-bold text-center">
              {teamName} a buzzé !
            </p>
            <p className="text-center mt-4 text-2xl">Temps restant : {timer}s</p>
          </div>
        </div>
      ) : (
        <div></div>
      )
      }
    </div >
  );
};

export default GameMaster;
