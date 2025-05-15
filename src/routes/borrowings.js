const express = require("express")
const router = express.Router()
const borrowingsController = require("../controllers/borrowings")

// All routes are protected by the API Gateway

router.get("/", borrowingsController.getAllBorrowings)
router.get("/student", borrowingsController.getBorrowingsByStudent)
router.post("/", borrowingsController.createBorrowing)
router.put("/:id/return", borrowingsController.returnBook)
router.delete("/:id", borrowingsController.deleteBorrowing)

module.exports = router
