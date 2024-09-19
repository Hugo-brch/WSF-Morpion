const express = require("express");
const prisma = require("../config/prisma");
const userRoutes = require("./routes/v1/userRoutes");
const gameRoutes = require("./routes/v1/gameRoutes");
const app = express();

app.use(express.json());

// teste de la connexion avec la base de données
prisma
  .$connect()
  .then(() => {
    console.log("Database OK");
  })
  .catch((err) => {
    console.error(
      "Veuillez verifier le champ DATABASE_URL dans le fichier .env",
      err
    );
  });

// route gestion des utilisateurs
app.use("/api/v1/users", userRoutes);

// route gestion des parties
app.use("/api/v1/games", gameRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API tourne sur le port ${PORT}`);
});
