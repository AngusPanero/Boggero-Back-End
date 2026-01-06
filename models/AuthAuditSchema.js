const mongoose = require("mongoose");

const AuthAuditSchema = new mongoose.Schema({
  // 🔐 Identidad
  uid: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },

  // 📌 Evento
  event: {
    type: String,
    enum: [
      "login",
      "logout",
      "token_refresh",
      "session_expired",
      "forced_logout",
      "invalid_token"
    ],
    required: true,
    index: true
  },

  // 🌍 Contexto
  ip: {
    type: String,
    index: true
  },
  userAgent: String,
  country: String,

  // ⏱️ Timestamp inmutable
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  },

  // 🧠 Info extra (para incidentes)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }

}, {
  versionKey: false
});

module.exports = mongoose.model("AuthAudit", AuthAuditSchema);