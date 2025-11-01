require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { urlencoded } = require("body-parser")
const cookieParser = require("cookie-parser")
const dbConnection = require("./config/mongoose")
const contactRouter = require("./routes/contactRouter")
const authRouter = require("./routes/authRoutes")
const houseRouter = require("./routes/houseRouter")
const app = express()
const PORT = process.env.PORT

app.use(urlencoded({ extended: true }))
app.use(express.json())

app.use(cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

dbConnection()

app.use(authRouter)
app.use(contactRouter)
app.use(houseRouter)

app.use((req, res) => {
    res.send(`<h1>404 - Not Found</h1>`)
})

app.listen(PORT, (req, res) => {
    console.log(`Server listening on port http://localhost:${PORT} 🟢`);
})