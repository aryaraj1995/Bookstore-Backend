const express =require("express")
const userController =require("../controllers/userController")
const authMiddleware =require("../middlewares/authMiddleware")
const multerMiddleware =require("../middlewares/multerMiddleware")
const bookController =require("../controllers/bookController")
const adminMiddleware =require("../middlewares/adminMiddleware")
const router = new express.Router()

// register
router.post("/register",userController.registerController)

// login
router.post("/login",userController.loginController)

// google login
router.post("/google-login",userController.googleLoginController)

// homebooks
router.get("/home-books",bookController.getHomeBookController)


// .................Authorized user - USER....................


// user edit -jwt middileware
router.put("/user/:id",authMiddleware,multerMiddleware.single("picture"),userController.userEditController)

// add book -jwt middileware
router.post("/books",authMiddleware,multerMiddleware.array("uploadedImages",3),bookController.addBookController)

// get all books
router.get("/all-books",authMiddleware,bookController.getBooksPageController)

// get user upload books
router.get("/user-books",authMiddleware,bookController.getUserBooksController)

// get user Brought books
router.get("/brought-books",authMiddleware,bookController.getUserBroughtBooksController)

// remove user upload books
router.delete("/books/:id",authMiddleware,bookController.removeUserUploadBookController)

// get view books
router.get("/books/:id",authMiddleware,bookController.viewBookController)

// get book abstract -AI
router.post("/books-ai",authMiddleware,bookController.generateBookDetailsAIController)

// book payment
router.put("/books/:id/buy",authMiddleware,bookController.bookPaymentController)

// .................Authorized user - ADMIN....................

// admin profile edit -
router.put("/admin/:id",adminMiddleware,multerMiddleware.single("picture"),userController.userEditController)

// get all users
router.get("/user-list",adminMiddleware,userController.getAllUsersController)

// get all books
router.get("/book-list",adminMiddleware,bookController.getHomeBookController)
// update book status
router.put("/book/:id",adminMiddleware,bookController.updateBookStatusController)

module.exports =router

