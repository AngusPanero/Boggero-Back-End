const auth = require("../config/firebase");

const verifyToken = async (req, res, next) => {
    try {
        const token =
            req.cookies?.idToken || // NAVEGADOR
            req.headers.authorization?.split(" ")[1]; // POSTMAN
            
            console.log("token", token);
        
        if (!token) {
            return res.status(401).json({ message: "No credentials" });
        }

        const decoded = await auth.verifyIdToken(token);
        req.user = decoded;

        next();

    } catch (error) {
        console.error("Unauthorized 🔴", error);
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
};

module.exports = verifyToken;