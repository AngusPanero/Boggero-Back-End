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

authRouter.post("/login", async (req, res) => {
    const { idToken } = req.body
    try {
        if(!idToken){
            res.status(400).send({ message: `Null or undefined idToken! 🔴` })
        }
        const decoded = await auth.verifyIdToken(idToken)
        res.cookie("idToken", idToken, { hhtpOnly: true, secure: false })
        res.status(200).send({ message: `Session logged successfully! 🟢` })

    } catch (error) {
        console.error(`Error login user! 🔴 ${error}`);
        res.status(500).send({ message: `Error login user! 🔴 ${error}` })
    }
})

authRouter.post("/logout", async (req, res) => {
    try {
        res.clearCookie("idToken")
        res.status(200).send({ message: `Session destroyed succesfully! 🟢` })
    } catch (error) {
        console.error(`Error destroying session! 🔴 ${error}`);
        res.status(500).send({ message: `Error destroying session! 🔴 ${error}` })
    }
})

module.exports = authRouter