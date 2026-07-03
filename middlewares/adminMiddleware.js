const jwt = require("jsonwebtoken")

const adminMiddleware = (req, res, next) => {
    console.log("Inside adminMiddleware");
    const token = req.headers['authorization'].split(" ")[1]
    console.log(token);
    if (token) {
        try {
            const jwtResponse = jwt.verify(token, process.env.JWTSECRET)
            console.log(jwtResponse);
            req.payload = jwtResponse.userMail
            const role =jwtResponse.role
            if (role=="admin"){
               next()
            }else{
                res.status(401).json("Authorization failed...Unauthorized User!!!..")
            }
            
        } catch (err) {
            console.log(err);
            res.status(401).json("Invalid Token...Please login..")
        }
    } else {
        res.status(401).json("Authorization Failed...Token missing..")
    }
}
module.exports = adminMiddleware
