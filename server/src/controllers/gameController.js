const prisma = require("../../config/prisma");

// Fonction pour créer une partie
exports.createGame = async (req, res) => {
  const { player1Id, player2Id } = req.body;
  console.log(player1Id, player2Id);
  try {
    // Création de la partie avec l'id des joueurs et le plateau de jeu vide
    const game = await prisma.game.create({
      data: {
        player1Id,
        player2Id,
        board: "         ",
        status: "en cours",
      },
    });
    console.log(game);

    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: "Failed to create game" });
    console.log(error);
  }
};

exports.getGameStatus = async (req, res) => {
  const { id } = req.params;
  try {
    // Récupération de la partie avec les noms des joueurs
    const game = await prisma.game.findUnique({
      where: { id: parseInt(id) },
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
      },
    });
    console.log(game);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ error: "Failed to retriev game status" });
    console.log(error);
  }
};

function checkWinner(board) {
  // Combinaisons gagnantes possibles
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < winningCombinations.length; i++) {
    const [a, b, c] = winningCombinations[i];
    // console.log(board[a], board[b], board[c]);

    if (board[a] !== " " && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

exports.playMove = async (req, res) => {
  // Récupération des données de la requête
  const id = req.params.id;
  const playerId = req.body.playerId;
  const position = req.body.position;

  try {
    // On récupère la partie
    const game = await prisma.game.findUnique({
      where: { id: parseInt(id) },
    });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // On vérifie que la partie est encore en cours
    if (game.status !== "en cours") {
      return res
        .status(400)
        .json({ error: `Game has already ended with status: ${game.status}` });
    }

    // Verification de l'id du joueur s'il est bien le joueur 1 ou 2
    if (playerId !== game.player1Id && playerId !== game.player2Id) {
      return res
        .status(403)
        .json({ error: "You are not a player in this game" });
    }

    // On vérifie si la position est valide
    const boardArray = game.board.split("");
    if (position < 0 || position > 8 || boardArray[position] !== " ") {
      return res.status(400).json({
        error: "Invalid move",
      });
    }

    // On détermine quel joueur joue (X ou O)
    let currentPlayerSymbol;
    if (playerId === game.player1Id) {
      currentPlayerSymbol = "X";
    } else {
      currentPlayerSymbol = "O";
    }

    // mise a jour du tableau de jeu
    boardArray[position] = currentPlayerSymbol;
    const updatedBoard = boardArray.join("");

    // verification du gagnant
    const winner = checkWinner(updatedBoard);

    // Mise à jour du statut de la partie
    let updatedStatus = "en cours";
    if (winner) {
      updatedStatus = `gagné par ${winner}`;
    } else if (isBoardFull(updatedBoard)) {
      updatedStatus = "nul";
    }

    // S'il y a un gagnant ou si le plateau est plein, la partie est terminée
    const updatedGame = await prisma.game.update({
      where: { id: parseInt(id) },
      data: {
        board: updatedBoard,
        status: updatedStatus,
      },
    });

    res.status(200).json(updatedGame);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while playing the move" });
  }
};

// Fonction pour vérifier si le plateau est plein
function isBoardFull(board) {
  if (board.indexOf(" ") === -1) {
    return true;
  } else {
    return false;
  }
}
