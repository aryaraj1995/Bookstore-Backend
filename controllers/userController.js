const users = require("../models/userModel")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

// register
exports.registerController = async (req, res) => {
    console.log("inside register controller");
    console.log(req.body);
    const { username, email, password, role } = req.body

    // check email is in DB
    const existingUser = await users.findOne({ email })

    // if present -send response please login
    if (existingUser) {
        res.status(409).json("user Already Exist..please login")
    } else {
        // else -add details to DB, response as newly added details
        let encryptedPassword = await bcrypt.hash(password, 10)
        const newUser = await users.create({ username, email, password: encryptedPassword })
        res.status(201).json(newUser)
    }
}

// login
exports.loginController = async (req, res) => {
    console.log("inside Login controller");

    const { email, password } = req.body
    const existingUser = await users.findOne({ email })

    if (existingUser) {
        const ispasswordMatch = await bcrypt.compare(password, existingUser.password)
        if (ispasswordMatch) {
            const token = jwt.sign(
                { userMail: email, role: existingUser.role },
                process.env.JWTSECRET
            )
            res.status(200).json({
                user: existingUser,
                token
            })
        } else {
            res.status(409).json("Password Doesn't Match")
        }
    } else {
        res.status(409).json("Invalid Email..Please register to Access !!!")
    }
}
// /Google login
exports.googleLoginController = async (req, res) => {

    const { email, password, username, picture } = req.body

    // check email is in DB
    const existingUser = await users.findOne({ email })
    console.log("Existing User:", existingUser);
    if (existingUser) {
        const token = jwt.sign({ userMail: existingUser.email, role: existingUser.role }, process.env.JWTSECRET)
        res.status(200).json({
            user: existingUser, token
        })

    } else {
        // if not present register user
        let encryptedPassword = await bcrypt.hash(password, 10)
        const newUser = await users.create({ username, email, password: encryptedPassword, picture })
        const token = jwt.sign({ userMail: newUser.email, role: newUser.role }, process.env.JWTSECRET)
        res.status(200).json({ user: newUser, token })
        res.status(409).json("Invalid Email..Please register to Access !!!")
    }
}

// user/admin edit
exports.userEditController = async (req, res) => {
    console.log("inside userEditController");
    const { id } = req.params
    const email = req.payload
    const { username, password, bio, picture, role } = req.body
    const encryptedPassword = await bcrypt.hash(password, 10)
    const updatePicture = req.file ? req.file.filename : picture
    const updateUser = await users.findOneAndUpdate({ _id: id }, { username, email, password: encryptedPassword, picture: updatePicture, bio, role }, { new: true })
    res.status(200).json(updateUser)
}
// get all users except admin
exports.getAllUsersController = async (req, res) => {
    console.log("inside getAllUsersController");
    const allUsers =await users.find({role:{$ne:"admin"}})
    res.status(200).json(allUsers)
}