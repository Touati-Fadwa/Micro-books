const express = require("express")
const router = express.Router()
const booksController = require("../controllers/books")

// All routes are protected by the API Gateway


router.get("/", booksController.getAllBooks)
router.get("/:id", booksController.getBookById)
router.post("/", booksController.createBook)
router.put("/:id", booksController.updateBook)
router.delete("/:id", booksController.deleteBook)

module.exports = router
