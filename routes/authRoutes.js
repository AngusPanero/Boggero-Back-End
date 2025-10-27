const express = require("express")
const authRouter = express.Router()
const auth = require("../config/firebase")

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
        res.status(500).send({ message: `Error creating user! 🔴 ${error}` })
    }
})

module.exports = authRouter