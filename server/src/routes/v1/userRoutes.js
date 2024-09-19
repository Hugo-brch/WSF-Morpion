const express = require("express");
const userController = require("../../controllers/userController");
const router = express.Router();

// Routes pour les utilisateurs
router.post("/register", userController.register);

router.post("/login", userController.login);

module.exports = router;
