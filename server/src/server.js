const express = require("express");
const prisma = require("../config/prisma");
const userRoutes = require("./routes/v1/userRoutes");
const app = express();

app.use(express.json());

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

app.use("/api/v1/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API tourne sur le port ${PORT}`);
});
