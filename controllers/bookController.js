const { response } = require("express");
const books =require("../models/bookModel")
const stripe =require('stripe')(process.env.STRIPE_SK)
const {GoogleGenerativeAI}=require("@google/generative-ai")

// add book
exports.addBookController =async (req,res)=>{
    console.log("Inside AddBook controller");
    // get book details from user
    const{title,author,pages,imageURL,price,discountPrice,abstract,publisher,isbn,language,category}= req.body
    const uploadedImages =req.files.map(item=>item.filename)
    const sellerMail =req.payload
    console.log(title,author,pages,imageURL,price,discountPrice,abstract,publisher,isbn,language,category,uploadedImages,sellerMail);
    // check book exit
    const existingBook =await books.findOne({title,sellerMail})
    if(existingBook){
        res.status(409).json("Book Already exists...Operation Denied..")
    }else{
        const newBook =await books.create({title,author,pages,imageURL,price,discountPrice,abstract,publisher,isbn,language,category,uploadedImages,sellerMail})
        res.status(200).json(newBook)
    }
}
// get latest books: 4 books
exports.getHomeBookController = async(req,res)=>{
    console.log("Inside GetHomeBookController");
    const homeBooks = await books.find().sort({_id:-1}).limit(4)
    res.status(200).json(homeBooks)
}
// get all books:login user -ignore books uploaded by login user
 exports.getBooksPageController = async(req,res)=>{
    console.log("Inside getBooksPageController");
    const loginUser = req.payload
    const searchKey =req.query.search
    const allBooks = await books.find({sellerMail:{$ne:loginUser}, title:{$regex:searchKey,$options:"i"}})
    res.status(200).json(allBooks)
}

// get user profile book:login user
 exports.getUserBooksController = async(req,res)=>{
    console.log("Inside getUserBooksController");
    const loginUserMail = req.payload
    const userUploadBooks = await books.find({sellerMail:loginUserMail})
    res.status(200).json(userUploadBooks)
}
// get user brought books :login user
 exports.getUserBroughtBooksController = async(req,res)=>{
    console.log("Inside getUserBroughtBooksController");
    const loginUserMail = req.payload
    const userBroughtBooks = await books.find({buyerMail:loginUserMail})
    res.status(200).json(userBroughtBooks)
}
// delete books by user : login user
 exports.removeUserUploadBookController = async(req,res)=>{
    console.log("removeUserUploadBookController");
    const loginUserMail = req.payload
    const {id} =req.params
    const removeBook = await books.findByIdAndDelete({_id:id})
    res.status(200).json(removeBook)
}
// get single book to view 
 exports.viewBookController = async(req,res)=>{
    console.log("Inside getUserBooksController");
    const {id} = req.params
    const bookDetails = await books.findById({_id:id})
    res.status(200).json(bookDetails)
}

// get all books : at admin resource page
 exports.getAllBooksController = async(req,res)=>{
    console.log("Inside getAllBooksController");
    const allBooks = await books.find()
    res.status(200).json(allBooks)
}
// update book status : admin part
 exports.updateBookStatusController = async(req,res)=>{
    console.log("Inside updateBookStatusController");
    const {id}=req.params
    const bookDetails = await books.findById({_id:id})
    bookDetails.status="approved"
    await bookDetails.save()
    res.status(200).json(bookDetails)
}

// book payment
exports.bookPaymentController = async (req,res)=>{
    try{
   console.log("Inside bookPaymentController");
    const buyerMail =req.payload
    const {id} = req.params
    const bookDetails =await books.findById({_id:id})
    bookDetails.status="sold"
    bookDetails.buyerMail =buyerMail
    await bookDetails.save()
    // create stripe checkout
    const  line_items =[{
        price_data:{
            currency : "usd",
            product_data :{
                name:bookDetails.title,
                description :`${bookDetails.author},${bookDetails.publisher}`,
                
                metadata :{
                    title:bookDetails.title,author:bookDetails.author,price:bookDetails.discountPrice
                }
            },
            unit_amount : Math.round(bookDetails.discountPrice*100)
        },
        quantity:1
    }] 
    const session = await stripe.checkout.sessions.create({
     success_url: 'https://bookstore-frontend-mu-umber.vercel.app/success',
     cancel_url: 'https://bookstore-frontend-mu-umber.vercel.app/cancel',
     line_items,
      mode: 'payment',
      payment_method_types:['card']
 });
    console.log(session);
    res.status(200).json({checkOutURL:session.url})
    }catch (err) {
    console.log("STRIPE ERROR:", err);
    res.status(500).json(err.message);
  }
   
    
}

// Get book Abstract using Gemini API
exports.generateBookDetailsAIController = async(req,res)=>{
    console.log("Inside generateBookDetailsAIController");
    const genAI =new GoogleGenerativeAI(process.env.GEMINI_API)
    const {title}=req.body
    const model =genAI.getGenerativeModel({model:"gemini-2.5-flash"})
    const result=await model.generateContent(`Give me a short Abstract of the book ${title}`)
    const replay =result.response
    console.log(replay);
    res.status(200).json({
        success:true,
        user:title,
        content:replay.candidates[0].content.parts[0].text
    }) 
}
