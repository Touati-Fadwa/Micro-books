const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const helmet = require("helmet")
const { sequelize } = require("./models")
const booksRoutes = require("./routes/books")
const categoriesRoutes = require("./routes/categories")
const borrowingsRoutes = require("./routes/borrowings")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3003

// Middlewares
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())

// Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Books service is running" })
})


app.use("/api/categories", categoriesRoutes)
app.use("/api/books", booksRoutes)
app.use("/api/borrowings", borrowingsRoutes)


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    status: "error",
    message: "Something went wrong!",
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  })
})

// Database connection and server start
sequelize
  .sync({ alter: process.env.NODE_ENV === "development" })
  .then(() => {
    console.log("Database connected")

    // Create default categories if they don't exist
    const { Category } = require("./models")
    const defaultCategories = [
      { name: "Roman" },
      { name: "Science-Fiction" },
      { name: "Informatique" },
      { name: "Histoire" },
      { name: "Mathématiques" },
      { name: "Physique" },
      { name: "Biologie" },
      { name: "Économie" },
    ]

    Promise.all(
      defaultCategories.map((category) =>
        Category.findOrCreate({ where: { name: category.name }, defaults: category }),
      ),
    )
      .then(() => console.log("Default categories created"))
      .catch((err) => console.error("Error creating default categories:", err))

    app.listen(PORT, () => {
      console.log(`Books service running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err)
  })

module.exports = app
