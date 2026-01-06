/* const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const SessionSchema = require("../models/SessionSchema");

const loggedRouter = express.Router();

loggedRouter.get("/sessions", verifyToken, async (req, res) => {
    const sessions = await SessionSchema.find({ uid: req.user.uid })
        .sort({ createdAt: -1 });

    res.json(sessions);
});

module.exports = loggedRouter; */