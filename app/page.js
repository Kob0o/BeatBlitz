"use client";

import React from "react";
import { useState } from "react";
// import {Button} from '@mui/material';
import Link from "next/link";


const GameMaster = () => {
  const [id, setId] = useState("");


  return (
    <div className="flex flex-col align-center justify-center h-screen gap-4 bg-gradient-to-r from-primary to-secondary">
      <p className="text-center text-white font-bold py-2 px-4 mb-12 text-2xl">
        Bienvenue dans BeatBlitz !
      </p>
      <div>
        <div className="flex justify-center">
          <Link href="./admin">
            <button className="border-2 rounded-md p-2 border-white text-white mr-24">
              Créer une partie !
            </button>
          </Link>

          <Link href="./buzzer">
            <button className="border-2 rounded-md p-2 border-white text-white">
              Rejoindre une partie !
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameMaster;