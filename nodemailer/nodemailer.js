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
        subject: `Nueva Consulta De Una Propiedad`,
        html: `
            <div style="background:#faf7f5;color:#2e2e2e;font-family:'Alumni Sans Pinstripe',sans-serif;padding:2rem;border:2px solid #e6b7c2;border-radius:8px;max-width:600px;margin:0 auto;">
                <h1 style="color:#d98aa5;border-bottom:1px solid #e6b7c2;padding-bottom:0.5rem;margin-bottom:1rem;">🏠 Nueva Consulta de Propiedad</h1>

                <p><strong style="color:#d98aa5;">Nombre:</strong> ${name.toUpperCase()} ${lastName.toUpperCase()}</p>
                <p><strong style="color:#d98aa5;">Teléfono:</strong> ${phone}</p>
                <p><strong style="color:#d98aa5;">Tipo de Operación:</strong> ${type}</p>
                <p><strong style="color:#d98aa5;">Email:</strong> ${email.toUpperCase()}</p>
                <p><strong style="color:#d98aa5;">Comentario:</strong><br />${comment}</p>

                <hr style="border:1px solid #e6b7c2;margin:2rem 0;" />

                <footer style="font-size:1.1rem;color:#6a6a6a;text-align:center;">
                    Sitio de consultas de <strong style="color:#d98aa5;">Boggero Propiedades</strong><br />
                    Buenos Aires - Argentina<br />
                    Desarrollado por <strong style="color:#d98aa5;">DeepDev.</strong>
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