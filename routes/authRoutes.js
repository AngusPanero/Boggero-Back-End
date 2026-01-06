const express = require("express")
const loginLimiter = require("../middleware/rateLimitMiddleware.js")
const authRouter = express.Router()
const auth = require("../config/firebase")
const AuthAuditSchema = require("../models/AuthAuditSchema.js")
const verifyToken = require("../middleware/authMiddleware.js")
const crypto = require("crypto");

authRouter.post("/register", async (req, res) => {
    const { email, password } = req.body
    try {
        if(!email || !password){
            res.status(400).send({ message: `All fields are required to create a user! 🔴` })
        }
        await auth.createUser({ email, password })
        res.status(201).send({ message: `User created successfully! 🟢` })
    } catch (error) {
        console.error(`Error creating user! 🔴 ${error}`);
        res.status(500).send({ message: `Error creating user! 🔴` })
    }
})

authRouter.post("/login", loginLimiter, async (req, res) => {
  const { idToken } = req.body;

  try {
    const decoded = await auth.verifyIdToken(idToken);

    await AuthAuditSchema.create({
      uid: decoded.uid,
      email: decoded.email,
      event: "login",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.cookie("idToken", idToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false
    });

    return res.status(200).json({ message: "Login audited 🟢" });

  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token 🔴" });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (idToken) {
      const decoded = await auth.verifyIdToken(idToken);

      await AuthAuditSchema.create({
        uid: decoded.uid,
        email: decoded.email,
        event: "logout",
        ip: req.ip,
        userAgent: req.headers["user-agent"]
      });
    }

    return res.status(200).json({ message: "Logout audited 🟢" });

  } catch (error) {
    console.error(error);
    return res.status(200).json({ message: "Logout fallback 🟡" });
  }
});

module.exports = authRouter