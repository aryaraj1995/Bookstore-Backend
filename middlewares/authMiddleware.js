const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
    console.log("Inside authMiddleware");
    const token = req.headers['authorization'].split(" ")[1]
    console.log(token);
    if (token) {
        try {
            const jwtResponse = jwt.verify(token, process.env.JWTSECRET)
            console.log(jwtResponse);
            req.payload = jwtResponse.userMail
            next()

        } catch (err) {
            console.log(err);
            res.status(401).json("Invalid Token...Please login..")
        }
    } else {
        res.status(401).json("Authorization Failed...Token missing..")
    }
}
module.exports = authMiddleware
