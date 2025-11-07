require("dotenv").config()
const express = require("express");
const nodemailer = require("nodemailer");

const mailRouter = express.Router()

mailRouter.post("/sendemail", async (req,res) => {
    const { name, lastName, phone, email, type, comment } = req.body

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS_EMAIL
        }
    })

    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL, // A dónde querés que llegue el Mail
        subject: `Nueva Consulta e Una Propiedad`,
        html: `
        <div style="
            background-color: #141414;
            color: #f0f0f0;
            font-family: 'Alumni Sans Pinstripe', sans-serif;
            padding: 2rem;
            border: 3px solid #b39b6d;
            border-radius: 8px;
            max-width: 600px;
            margin: 0 auto;
        ">
            <h1 style="color: #b39b6d; border-bottom: 1px solid #b39b6d; padding-bottom: 0.5rem;">
                🏠 Nueva Consulta de Propiedad
            </h1>

            <p><strong>Nombre:</strong> ${name} ${lastName}</p>
            <p><strong>Teléfono:</strong> ${phone}</p>
            <p><strong>Tipo de Operación:</strong> ${type}</p>
            <p><strong>Email:</strong> ${email.toUpperCase()}</p>
            <p><strong>Comentario:</strong><br />${comment}</p>
            
            <hr style="border: 1px solid #b39b6d; margin: 2rem 0;" />

            <footer style="font-size: 1.1rem; color: #aaa; text-align: center;">
                Sitio de consultas de <strong style="color: #b39b6d;">Boggero Propiedades</strong><br />
                Buenos Aires - Argentina
                Desarrollado por <strong style="color: #b39b6d;">DeepDev.</strong>
            </footer>
        </div>
    `
    }
    try {
        await transporter.sendMail(mailOptions)
        res.status(200).json({ success: true, message: 'Correo enviado con éxito' })
    } catch (error) {
        console.error(`Internal error setting up mail transporter! 🔴 ${error}`);
        res.status(500).send({ message: `Internal error setting up mail transporter! 🔴 ${error}` })
    }
})

module.exports = mailRouter