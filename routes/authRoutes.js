const express = require("express")
const loginLimiter = require("../middleware/rateLimitMiddleware.js")
const authRouter = express.Router()
const auth = require("../config/firebase")
const AuthAuditSchema = require("../models/AuthAuditSchema.js")
const checkBanned = require("../middleware/checkBanned.js")
const verifyToken = require("../middleware/authMiddleware.js")

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
    console.log("BANNED?", decoded.banned);

    if (!decoded.banned) {
      await AuthAuditSchema.findOneAndUpdate(
        { email: decoded.email, event: "login_failed" },
        {
          $set: {
            attempts: 0,
            lastAttemptAt: null
          }
        }
      );
    }

    await AuthAuditSchema.create({
      uid: decoded.uid,
      email: decoded.email,
      event: "login",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      attempts: decoded.attempts
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

authRouter.post("/login-failed", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required to audit failed login 🔴" });
  }
  try {
    const now = Date.now();

    const attempt = await AuthAuditSchema.findOneAndUpdate(
      { email, event: "login_failed" },
      {
        $inc: { attempts: 1 },
        $set: { lastAttemptAt: now }
      },
      { upsert: true, new: true }
    );
    if (attempt.attempts >= 5) {
      const user = await auth.getUserByEmail(email);
      
      await auth.setCustomUserClaims(user.uid, {
        banned: true,
        bannedAt: now,
        bannedReason: "Too many failed login attempts"
      });

      await auth.revokeRefreshTokens(user.uid);
      return res.status(200).json({ message: "User banned due to too many failed attempts 🔴" });
    }
    return res.status(200).json({ message: "Failed login attempt recorded 🟡", attempts: attempt.attempts }); 

  } catch (error) {
    console.error("Login failed audit error:", error);
    return res.status(500).json({ message: "Error auditing failed login 🔴" });  
  }
});

authRouter.get("/me", verifyToken, checkBanned, (req, res) => {
  res.status(200).json({
    uid: req.user.uid,
    email: req.user.email,
    role: req.user.admin ? "admin" : "user"
  });
});

module.exports = authRouter