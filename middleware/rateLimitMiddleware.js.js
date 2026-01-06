const rateLimit = require("express-rate-limit")

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50,                 // 50 por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Comportamiento sospechoso... Demasiadas solicitudes, intentá más tarde"
    }
});

module.exports = loginLimiter;