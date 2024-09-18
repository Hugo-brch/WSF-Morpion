const prisma = require("../../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { username, password, email } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);

  try {
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

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET
  );

  res.status(200).json({ message: "Login successful", token });
};
