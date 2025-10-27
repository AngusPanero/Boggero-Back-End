const express = require("express")
const contactRouter = express.Router()
const Contact = require("../models/ContactSchema")

contactRouter.get("/contact", (req, res) => {
    res.send(`<h1>Funciona Contact!</h1>`)
})

module.exports = contactRouter