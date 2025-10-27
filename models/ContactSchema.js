const mongoose = require("mongoose")

const ContactSchema = new mongoose.Schema ({
    title: {
        type: String,
        required: true
    },
    imageUrl: {
        type: [String], // Si subo imágenes en string que eso esperaría si subo varias
        required: true
    }
}, { timestamps: true })

const Contact = mongoose.model("contact", ContactSchema)

module.exports = Contact
