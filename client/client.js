const axios = require("axios");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let player1Token = null;
let player2Token = null;
let currentPlayer = "X";
let player1Id = null;
let player2Id = null;
let gameId = null;

function askQuestion(query) {
  return new Promise(function (resolve) {
    rl.question(query, resolve);
  });
}

function displayBoard(board) {
  console.log(`
     ${board[0]} | ${board[1]} | ${board[2]}
    ---|---|---
     ${board[3]} | ${board[4]} | ${board[5]}
    ---|---|---
     ${board[6]} | ${board[7]} | ${board[8]}
  `);
}

async function register() {
  const username = await askQuestion("Enter username: ");
  const password = await askQuestion("Enter password: ");

  try {
    const response = await axios.post(
      "http://localhost:3000/api/v1/users/register",
      {
        username: username,
        password: password,
      }
    );
    console.log("User registered successfully:", response.data);
  } catch (error) {
    console.log("Error registering user:", error.message);
  }
}

async function loginPlayer1() {
  const username = await askQuestion("Player 1 (X) - Enter username: ");
  const password = await askQuestion("Player 1 (X) - Enter password: ");

  try {
    const response = await axios.post(
      "http://localhost:3000/api/v1/users/login",
      {
        username: username,
        password: password,
      }
    );

    player1Token = response.data.token;
    player1Id = response.data.user.id;
    console.log("Player 1 (X) login successful.");
  } catch (error) {
    console.log("Error logging in Player 1 (X):", error.message);
  }
}

async function loginPlayer2() {
  const username = await askQuestion("Player 2 (O) - Enter username: ");
  const password = await askQuestion("Player 2 (O) - Enter password: ");

  try {
    const response = await axios.post(
      "http://localhost:3000/api/v1/users/login",
      {
        username: username,
        password: password,
      }
    );

    player2Token = response.data.token;
    player2Id = response.data.user.id;
    console.log("Player 2 (O) login successful.");
  } catch (error) {
    console.log("Error logging in Player 2 (O):", error.message);
  }
}

async function createGame() {
  if (!player1Token || !player2Token) {
    console.log("Both player need to be logged in.");
    return;
  }

  console.log("Player 1 ID:", player1Id);
  console.log("Player 2 ID:", player2Id);

  try {
    const response = await axios.post(
      "http://localhost:3000/api/v1/games",
      { player1Id: player1Id, player2Id: player2Id },
      { headers: { Authorization: "Bearer " + player1Token } }
    );

    gameId = response.data.id;
    console.log("Game create with ID:", gameId);
    displayBoard(response.data.board);
    await gameLoop();
  } catch (error) {
    console.log("Error creating game:", error.message);
  }
}

async function playMove(playerToken, playerId) {
  if (!gameId) {
    console.log("No game ID found. Please create or join a game first.");
    return false;
  }

  const position = parseInt(
    await askQuestion(`Player ${currentPlayer} - Enter the position (0-8): `)
  );

  if (isNaN(position) || position < 0 || position > 8) {
    console.log("Invalid position. Please enter a number between 0 and 8.");
    return false;
  }

  try {
    const response = await axios.post(
      "http://localhost:3000/api/v1/games/" + gameId + "/move",
      { playerId: playerId, position: position },
      { headers: { Authorization: "Bearer " + playerToken } }
    );

    console.log("Move played by Player", currentPlayer);
    displayBoard(response.data.board);

    if (response.data.status !== "en cours") {
      mainMenu();
      return true;
    }

    return true;
  } catch (error) {
    console.log("Error playing move:", error.message);
    return false;
  }
}

async function gameLoop() {
  let gameOver = false;

  while (!gameOver) {
    let validMove = false;

    if (currentPlayer === "X") {
      validMove = await playMove(player1Token, player1Id);
    } else {
      validMove = await playMove(player2Token, player2Id);
    }

    if (validMove) {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
    } else {
      console.log("Invalid move. Try again.");
    }

    if (gameOver) {
      console.log("Returning to main menu...");
      await mainMenu();
      return;
    }
  }
}

async function mainMenu() {
  while (true) {
    console.log(
      "\n1. Register\n2. Login Player 1 (X)\n3. Login Player 2 (O)\n4. Create Game\n5. Exit"
    );

    const choice = await askQuestion("Choose an option: ");

    if (choice === "1") {
      await register();
    } else if (choice === "2") {
      await loginPlayer1();
    } else if (choice === "3") {
      await loginPlayer2();
    } else if (choice === "4") {
      await createGame();
    } else if (choice === "5") {
      console.log("Exiting...");
      rl.close();
      process.exit(0);
    } else {
      console.log("Invalid choice. Try again.");
    }
  }
}

mainMenu();
