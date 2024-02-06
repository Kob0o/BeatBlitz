const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const generateRandomTeamName = require("./utils/generateRandomTeamName");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

const io = new Server(server, {
  cors: {
    origin: "http://192.168.1.13:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3002;

const games = [];

const generateGameId = () => {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};

server.listen(PORT, '192.168.1.13', () => {
  console.log(`Serveur en écoute sur le port http://192.168.1.13:${PORT}`);
});

app.use("/", (req, res) => {
  res.send({ message: "Server JS" });
});

io.on("connection", (socket) => {
  // SOCKET - ADMIN
  socket.on("createGame", (nbEquipe) => {
    const gameId = generateGameId();

    // On ajoute l'id de la partie dans le tableau des parties
    // ainsi que le nombre d'équipe max à partir de 'nbEquipe' en se basant sur test.json
    // On ajoute également un tableau vide pour les équipes [nomEquipe, score]

    const teams = [];

    games.push({
      id: gameId,
      maxPlayers: nbEquipe,
      isBuzzed: false,
      teams: teams,
    });

    // On renvoie l'ID de la partie et les informations sur les équipes au client
    socket.emit("gameCreated", { gameId, teams });
  });

  // SOCKET - BUZZER
  socket.on("joinGame", (id) => {
    // On vérifie que la partie existe
    const gameInfo = games.find((game) => game.id === id);

    if (gameInfo) {
      // On vérifie que le nombre de joueurs n'est pas dépassé
      // On compare la longueur du tableau avec le nombre d'équipe max
      if (gameInfo.teams.length < gameInfo.maxPlayers) {
        // On génère un nom d'équipe aléatoire
        const teamName = generateRandomTeamName();

        // On ajoute le nom d'équipe au tableau des teams avec un score de 0
        gameInfo.teams.push({ name: teamName, score: 0 });

        console.log(gameInfo);
        // On renvoie l'ID de la partie, le nom d'équipe et les informations sur les équipes au client
        socket.emit("joinedGame", { gameId: id, teamName });
      } else {
        socket.emit("maxPlayersReached", id);
      }
    } else {
      socket.emit("gameNotFound", id);
    }
  });

  // SOCKET - GAME MASTER
  socket.on("joinGameMaster", (id) => {
    const gameInfo = games.find((game) => game.id === id);

    if (gameInfo) {
      // On renvoie l'ID de la partie, le nom d'équipe et les informations sur les équipes au client
      socket.emit("joinedGame", { gameId: id });
    } else {
      socket.emit("gameNotFound", id);
    }
  });

  // SOCKET - ROOM
  socket.on("joinRoom", (id) => {
    // Vérifie que la partie existe
    const gameInfo = games.find((game) => game.id === id);

    if (gameInfo) {
      // Rejoindre la room en fonction de l'ID de la partie
      socket.join(id);
      console.log(gameInfo)

      // Envoyer les informations sur la partie à toutes les personnes dans la room
      io.to(id).emit("gameInfo", gameInfo);
    } else {
      socket.emit("gameNotFound", id);
    }
  });

  socket.on("buzzer", ({ id, teamName }) => {
    // Vérifie que la partie existe
    const gameInfo = games.find((game) => game.id === id);

    if (gameInfo) {
      if (!gameInfo.isBuzzed) {
        // On envoie les informations sur le nom du joueur à toutes les personnes dans la room
        gameInfo.isBuzzed = true;
        io.to(id).emit("buzzed", teamName);
        io.to(id).emit("gameInfo", gameInfo);
      }
    } else {
      socket.emit("gameNotFound", id);
    }
  });

  socket.on("updateScore", ({ id, teamName, score }) => {
    // Vérifie que la partie existe
    const gameInfo = games.find((game) => game.id === id);

    if (gameInfo) {
      const teamIndex = gameInfo.teams.findIndex(
        (team) => team.name === teamName
      );
      let scoreEquipe = gameInfo.teams[teamIndex].score;
      gameInfo.teams[teamIndex].score = scoreEquipe + score;
      gameInfo.isBuzzed = false;
      io.to(id).emit("gameInfo", gameInfo);
    }
  });

  socket.on("followGame", (id) => {
    const gameInfo = games.find((game) => game.id === id);
    if (gameInfo) {
      gameInfo.isBuzzed = false;
      io.to(id).emit("gameInfo", gameInfo);
    }
  });

  socket.on("resetGame", (id) => {
    const gameInfo = games.find((game) => game.id === id);
    if (gameInfo) {
      gameInfo.isBuzzed = false;
      gameInfo.teams.forEach((team) => {
        team.score = 0;
      });
      io.to(id).emit("gameInfo", gameInfo);
    }
  });
});
