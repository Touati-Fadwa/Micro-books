const express = require("express")
const router = express.Router()
const categoriesController = require("../controllers/categories")

// All routes are protected by the API Gateway

router.get("/", categoriesController.getAllCategories)
router.get("/:id", categoriesController.getCategoryById)
router.post("/", categoriesController.createCategory)
router.put("/:id", categoriesController.updateCategory)
router.delete("/:id", categoriesController.deleteCategory)

module.exports = router
