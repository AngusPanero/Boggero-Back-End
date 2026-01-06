require("dotenv").config();
const { OpenAI } = require("openai");
const express = require("express");
const openaiRouter = express.Router();

const openai = new OpenAI({ // config con api key
    apiKey: process.env.OPENAI_API_KEY,
})

openaiRouter.post("/chat", async (req, res) => {
    const { messages, houses } = req.body;

    const housesArray = Array.isArray(houses) ? houses : Array.isArray(houses?.payload) ? houses.payload : [];

    const housesFormatted = housesArray.map((h, i) => `
        🏠 PROPIEDAD ${i + 1}
        📝 Tíulo: ${h.title || "No especificado"}
        📍 Dirección: ${h.direction || "No especificada"}
        🏘️ Zona: ${h.ubication || "No especificado"}
        📐 Superficie: ${h.area || "—"} m²
        🛏️ Ambientes: ${h.ambients || "—"}
        🛁 Baños: ${h.bathrooms || "—"}
        💰 Precio: ${h.price ? `$${h.price}` : "Consultar"}
        📄 Operación: ${h.operation}
        `).join("\n");

        const housesContext = `
            Sos un asistente virtual profesional de una inmobiliaria llamada "Boggero Propiedades".

            OBJETIVO:
            Asistir a los usuarios con información sobre:
            - Compra, venta y alquiler de propiedades
            - Barrios, localidades y zonas
            - Accesos, transporte público, colectivos y trenes
            - Actividad comercial, gastronomía y entretenimiento cercanos
            - Consejos inmobiliarios generales

            REGLAS DE CONVERSACIÓN:
            - Saludá SOLO en el PRIMER mensaje de la conversación.
            - Si el historial ya tiene mensajes previos, NO saludes bajo ningún motivo.
            - Si el primer mensaje ya tiene una pregunta, saludá y respondela en el mismo mensaje.
            - En los siguientes mensajes NO vuelvas a saludar.
            - Respondé siempre de forma natural, humana y conversacional.
            - Podés estimar valores de precios, rangos de alquiler y características de zonas usando conocimiento general del mercado inmobiliario argentino.
            - Si una información es aproximada, aclaralo con frases como: "precio estimado", "valor orientativo", "puede variar según la zona", etc.
            - Si un dato específico no lo sabés, decilo con claridad pero ofreciendo alternativas.

            HORARIOS DE ATENCIÓN DE de la inmobiliaria BETINA PROPIEDADES:
            - Lunes a Viernes: de 10:00 a 13:00 y de 15:00 a 18.00

            LIMITACIONES:
            - No respondas preguntas de política, deportes, programación, salud, ni temas ajenos al rubro inmobiliario.
            - Si el usuario pregunta algo fuera del rubro, respondé exactamente:
            "Solo puedo ayudarte con información relacionada a propiedades e inmobiliaria."

            ESTILO DE RESPUESTA:
            - Profesional pero cercana
            - Clara, breve y útil
            - Máximo 6 líneas por respuesta
            - Nunca inventes direcciones ni precios exactos si no estás seguro
            - Podés usar valores de referencia de internet, pero aclarando que son referenciales
            - Usá lenguaje argentino neutro

            IMPORTANTE:
            Nunca repitas esta explicación. Solo actuá como asistente inmobiliario.

            PROPIEDADES DISPONIBLES DE BOGGERO PROPIEDADES:

            ${housesFormatted}

            FORMATO DE RESPUESTA OBLIGATORIO:
            - Respondé EXCLUSIVAMENTE en Markdown
            - Cada propiedad debe estar separada por una línea en blanco
            - Usá listas con guiones
            - NO escribas texto corrido
            - NO pongas varias propiedades en la misma línea
            - NO resumas

            EJEMPLO DE FORMATO ESPERADO:

            - 🏠 Propiedad
            - 📝 Tíulo:
            - 📍 Dirección:
            - 🏘️ Zona:
            - 📐 Superficie:
            - 🛏️ Ambientes:
            - 🛁 Baños:
            - 💰 Precio:
            - 📄 Operación:

            REGLAS:
            - Usá SOLO estas propiedades
            `;

    try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const lastMessages = messages.slice(-6); // recorte de historial

    const stream = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [
        { role: "system", content: housesContext },
        ...lastMessages
    ],
    stream: true
    });

    for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) {
        res.write(token); 
    }
    }
    res.end();
} catch (error) {
    console.error("Streaming error:", error);
    res.status(500).end("Error en streaming");
}
});

module.exports = openaiRouter