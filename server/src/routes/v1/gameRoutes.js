const express = require("express");
const gameController = require("../../controllers/gameController");
const authenticateToken = require("../../middlewares/authMiddleware");
const router = express.Router();

// Routes pour les parties
router.post("/", authenticateToken, gameController.createGame);

router.get("/:id", authenticateToken, gameController.getGameStatus);

router.post("/:id/move", authenticateToken, gameController.playMove);

module.exports = router;
