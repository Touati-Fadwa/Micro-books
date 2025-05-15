const sequelize = require("../config/database")
const Book = require("./book")
const Category = require("./category")
const Borrowing = require("./borrowing")

// Define relationships
Category.hasMany(Book, { foreignKey: "categoryId" })
Book.belongsTo(Category, { foreignKey: "categoryId" })

Book.hasMany(Borrowing, { foreignKey: "bookId" })
Borrowing.belongsTo(Book, { foreignKey: "bookId" })

module.exports = {
  sequelize,
  Book,
  Category,
  Borrowing,
}
