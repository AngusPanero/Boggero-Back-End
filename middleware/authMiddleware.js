const auth = require('../config/firebase')

const verifyToken = async (req, res, next) => {
    try {
        const token =
            req.cookies?.idToken ||                       // navegador
            req.headers.authorization?.split(" ")[1]      // postman / api
        console.log(token);
            
        if(!token){
            return res.status(401).send({ message: `No credentials! 🔴` })
        }
        const decoded = await auth.verifyIdToken(token) 
// verifico el token
        req.user = decoded
        next()
    } catch (error) {
        console.error(`Unauthorized! 🔴 ${error.code}, ${error}`);
        return res.status(401).json({ message: "Unauthorized 🔴" })
    }
}

module.exports = verifyToken
