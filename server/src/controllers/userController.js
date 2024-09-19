const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  // on destructure body pour recuperé les données
  const { username, password, email } = req.body;

  // bloc de verification pour vérifier que tout les champ sont bien remplis
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // on hash le mot de passe avec le module bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);

  try {
    // on crée un utilisateur avec les données recupérées
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, email },
    });
    console.log(user);

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET
    );

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    res.status(400).json({ error: " " });
    console.log(error);
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  // bloc qui verifie si l'utilisateur existe et que le mot de passe est correct
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // on crée un token avec l'id et le nom d'utilisateur
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET
  );
  // retourne l'id et le nom d'utilisateur
  const returnUser = { id: user.id, username: user.username };
  res
    .status(200)
    .json({ message: "Login successful", token, user: returnUser });
};
