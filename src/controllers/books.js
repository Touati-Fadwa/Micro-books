const { Book, Category } = require("../models")
const { Op } = require("sequelize")

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const { title, author, categoryId } = req.query

    // Build filter conditions
    const whereConditions = {}

    if (title) {
      whereConditions.title = { [Op.iLike]: `%${title}%` }
    }

    if (author) {
      whereConditions.author = { [Op.iLike]: `%${author}%` }
    }

    if (categoryId) {
      whereConditions.categoryId = categoryId
    }

    const books = await Book.findAll({
      where: whereConditions,
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    // Transform data to include category name and availability
    const transformedBooks = books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publicationYear: book.publicationYear,
      publisher: book.publisher,
      description: book.description,
      coverImage: book.coverImage,
      quantity: book.quantity,
      availableQuantity: book.availableQuantity,
      categoryId: book.categoryId,
      categoryName: book.Category ? book.Category.name : null,
      available: book.availableQuantity > 0,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    }))

    res.status(200).json(transformedBooks)
  } catch (error) {
    console.error("Get books error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des livres" })
  }
}

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params

    const book = await Book.findByPk(id, {
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
    })

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" })
    }

    // Transform data
    const transformedBook = {
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publicationYear: book.publicationYear,
      publisher: book.publisher,
      description: book.description,
      coverImage: book.coverImage,
      quantity: book.quantity,
      availableQuantity: book.availableQuantity,
      categoryId: book.categoryId,
      categoryName: book.Category ? book.Category.name : null,
      available: book.availableQuantity > 0,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    }

    res.status(200).json(transformedBook)
  } catch (error) {
    console.error("Get book error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération du livre" })
  }
}

// Create book
exports.createBook = async (req, res) => {
  try {
    // Check if user is admin
   // if (req.user.role !== "admin") {
     // return res.status(403).json({ message: "Accès non autorisé" })
    //}

    const { title, author, isbn, publicationYear, publisher, description, coverImage, quantity, categoryId } = req.body

    // Validate required fields
    if (!title || !author || !categoryId) {
      return res.status(400).json({ message: "Titre, auteur et catégorie sont requis" })
    }

    // Check if category exists
    const category = await Category.findByPk(categoryId)

    if (!category) {
      return res.status(400).json({ message: "Catégorie non trouvée" })
    }

    // Create book
    const newBook = await Book.create({
      title,
      author,
      isbn,
      publicationYear,
      publisher,
      description,
      coverImage,
      quantity: quantity || 1,
      categoryId,
    })

    res.status(201).json({
      id: newBook.id,
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn,
      publicationYear: newBook.publicationYear,
      publisher: newBook.publisher,
      description: newBook.description,
      coverImage: newBook.coverImage,
      quantity: newBook.quantity,
      availableQuantity: newBook.availableQuantity,
      categoryId: newBook.categoryId,
      createdAt: newBook.createdAt,
      updatedAt: newBook.updatedAt,
    })
  } catch (error) {
    console.error("Create book error:", error)
    res.status(500).json({ message: "Erreur lors de la création du livre" })
  }
}

// Update book
exports.updateBook = async (req, res) => {
  try {
    // Check if user is admin
   // if (req.user.role !== "admin") {
     // return res.status(403).json({ message: "Accès non autorisé" })
    //}

    const { id } = req.params
    const { title, author, isbn, publicationYear, publisher, description, coverImage, quantity, categoryId } = req.body

    const book = await Book.findByPk(id)

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" })
    }

    // Check if category exists if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId)

      if (!category) {
        return res.status(400).json({ message: "Catégorie non trouvée" })
      }
    }

    // Calculate new available quantity if quantity is updated
    let newAvailableQuantity = book.availableQuantity
    if (quantity !== undefined) {
      const borrowedQuantity = book.quantity - book.availableQuantity
      newAvailableQuantity = Math.max(0, quantity - borrowedQuantity)
    }

    // Update book
    await book.update({
      title: title || book.title,
      author: author || book.author,
      isbn: isbn !== undefined ? isbn : book.isbn,
      publicationYear: publicationYear !== undefined ? publicationYear : book.publicationYear,
      publisher: publisher !== undefined ? publisher : book.publisher,
      description: description !== undefined ? description : book.description,
      coverImage: coverImage !== undefined ? coverImage : book.coverImage,
      quantity: quantity !== undefined ? quantity : book.quantity,
      availableQuantity: newAvailableQuantity,
      categoryId: categoryId || book.categoryId,
    })

    res.status(200).json({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publicationYear: book.publicationYear,
      publisher: book.publisher,
      description: book.description,
      coverImage: book.coverImage,
      quantity: book.quantity,
      availableQuantity: book.availableQuantity,
      categoryId: book.categoryId,
      updatedAt: book.updatedAt,
    })
  } catch (error) {
    console.error("Update book error:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour du livre" })
  }
}

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    // Check if user is admin
    //if (req.user.role !== "admin") {
      //return res.status(403).json({ message: "Accès non autorisé" })
    //}

    const { id } = req.params

    const book = await Book.findByPk(id)

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" })
    }

    // Check if book has active borrowings
    if (book.quantity !== book.availableQuantity) {
      return res.status(400).json({
        message: "Ce livre ne peut pas être supprimé car il a des emprunts actifs",
      })
    }

    await book.destroy()

    res.status(200).json({ message: "Livre supprimé avec succès" })
  } catch (error) {
    console.error("Delete book error:", error)
    res.status(500).json({ message: "Erreur lors de la suppression du livre" })
  }
}
