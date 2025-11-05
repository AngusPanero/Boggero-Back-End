require("dotenv").config();
const { OpenAI } = require("openai");
const express = require("express");
const openaiRouter = express.Router();

const openai = new OpenAI({ // config con api key
    apiKey: process.env.OPENAI_API_KEY,
})

openaiRouter.post("/chat", async (req, res) => {
    const { messages } = req.body
    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL, // Modelo a usar
            messages: [
                { // config de como responder
                    role: "system",
                    content: `
                        Sos un asistente virtual de inmobiliaria, al iniciar charla da la bienvenida al asistente de de IA de inmobiliaria Boggero.
                        Solo respondé preguntas relacionadas con compra, venta o alquiler de propiedades e informacion de barrios y localidades, acceso a trasporte, ofertas comerciales y gastronomicas y entretenimiento cercano.
                        Si te preguntan algo fuera del rubro inmobiliario, respondé educadamente:
                        "Solo puedo ayudarte con información relacionada a propiedades e inmobiliaria."
            
                        Estilo de respuesta:
                        - Profesional pero amable
                        - Breve y clara (no más de 5 líneas)
                        - Sin inventar datos, si no sabés, decilo con claridad
                    `
                },
                ...messages // req.body
            ]
        })
        res.status(200).send({ reply: response.choices[0].message.content }) // Devuelvo la respuesta
    } catch (error) {
        console.error(`Error communicating with OpenAI API! 🔴 ${error}`);
        res.status(500).send({ message: `Error communicating with OpenAI API! 🔴 ${error}` })
    }
})

module.exports = openaiRouter