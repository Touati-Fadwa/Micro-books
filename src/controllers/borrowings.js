const { Borrowing, Book } = require("../models")
const { Op } = require("sequelize")

// Get all borrowings
exports.getAllBorrowings = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const borrowings = await Borrowing.findAll({
      include: [
        {
          model: Book,
          attributes: ["id", "title", "author", "coverImage"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    // Transform data
    const transformedBorrowings = borrowings.map((borrowing) => ({
      id: borrowing.id,
      book: {
        id: borrowing.Book.id,
        title: borrowing.Book.title,
        author: borrowing.Book.author,
        coverImage: borrowing.Book.coverImage,
      },
      student: {
        id: borrowing.studentId,
        name: borrowing.studentName,
        email: borrowing.studentEmail,
      },
      borrowDate: borrowing.borrowDate,
      dueDate: borrowing.dueDate,
      returnDate: borrowing.returnDate,
      status: borrowing.status,
      notes: borrowing.notes,
      createdAt: borrowing.createdAt,
      updatedAt: borrowing.updatedAt,
    }))

    res.status(200).json(transformedBorrowings)
  } catch (error) {
    console.error("Get borrowings error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des emprunts" })
  }
}

// Get borrowings by student ID
exports.getBorrowingsByStudent = async (req, res) => {
  try {
    const studentId = req.user.id

    const borrowings = await Borrowing.findAll({
      where: { studentId },
      include: [
        {
          model: Book,
          attributes: ["id", "title", "author", "coverImage"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    // Transform data
    const transformedBorrowings = borrowings.map((borrowing) => ({
      id: borrowing.id,
      book: {
        id: borrowing.Book.id,
        title: borrowing.Book.title,
        author: borrowing.Book.author,
        coverImage: borrowing.Book.coverImage,
      },
      borrowDate: borrowing.borrowDate,
      dueDate: borrowing.dueDate,
      returnDate: borrowing.returnDate,
      status: borrowing.status,
      notes: borrowing.notes,
      createdAt: borrowing.createdAt,
      updatedAt: borrowing.updatedAt,
    }))

    res.status(200).json(transformedBorrowings)
  } catch (error) {
    console.error("Get student borrowings error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des emprunts" })
  }
}

// Create borrowing
exports.createBorrowing = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const { bookId, studentId, studentName, studentEmail, dueDate, notes } = req.body

    // Validate required fields
    if (!bookId || !studentId || !studentName || !studentEmail || !dueDate) {
      return res.status(400).json({
        message:
          "ID du livre, ID de l'étudiant, nom de l'étudiant, email de l'étudiant et date de retour prévue sont requis",
      })
    }

    // Check if book exists and is available
    const book = await Book.findByPk(bookId)

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" })
    }

    if (book.availableQuantity <= 0) {
      return res.status(400).json({ message: "Ce livre n'est pas disponible pour l'emprunt" })
    }

    // Create borrowing
    const borrowing = await Borrowing.create({
      bookId,
      studentId,
      studentName,
      studentEmail,
      borrowDate: new Date(),
      dueDate: new Date(dueDate),
      notes,
    })

    // Update book available quantity
    await book.update({
      availableQuantity: book.availableQuantity - 1,
    })

    res.status(201).json({
      id: borrowing.id,
      bookId: borrowing.bookId,
      studentId: borrowing.studentId,
      studentName: borrowing.studentName,
      studentEmail: borrowing.studentEmail,
      borrowDate: borrowing.borrowDate,
      dueDate: borrowing.dueDate,
      status: borrowing.status,
      notes: borrowing.notes,
    })
  } catch (error) {
    console.error("Create borrowing error:", error)
    res.status(500).json({ message: "Erreur lors de la création de l'emprunt" })
  }
}

// Return book
exports.returnBook = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const { id } = req.params

    const borrowing = await Borrowing.findByPk(id)

    if (!borrowing) {
      return res.status(404).json({ message: "Emprunt non trouvé" })
    }

    if (borrowing.returnDate) {
      return res.status(400).json({ message: "Ce livre a déjà été retourné" })
    }

    // Update borrowing
    await borrowing.update({
      returnDate: new Date(),
      status: "returned",
    })

    // Update book available quantity
    const book = await Book.findByPk(borrowing.bookId)

    if (book) {
      await book.update({
        availableQuantity: book.availableQuantity + 1,
      })
    }

    res.status(200).json({
      id: borrowing.id,
      returnDate: borrowing.returnDate,
      status: borrowing.status,
    })
  } catch (error) {
    console.error("Return book error:", error)
    res.status(500).json({ message: "Erreur lors du retour du livre" })
  }
}

// Delete borrowing
exports.deleteBorrowing = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const { id } = req.params

    const borrowing = await Borrowing.findByPk(id)

    if (!borrowing) {
      return res.status(404).json({ message: "Emprunt non trouvé" })
    }

    if (borrowing.returnDate) {
      return res.status(400).json({ message: "Ce livre a déjà été retourné" })
    }

    // Update borrowing
    await borrowing.update({
      returnDate: new Date(),
      status: "returned",
    })

    // Update book available quantity
    const book = await Book.findByPk(borrowing.bookId)

    if (book) {
      await book.update({
        availableQuantity: book.availableQuantity + 1,
      })
    }

    res.status(200).json({
      id: borrowing.id,
      returnDate: borrowing.returnDate,
      status: borrowing.status,
    })
  } catch (error) {
    console.error("Return book error:", error)
    res.status(500).json({ message: "Erreur lors du retour du livre" })
  }
}

// Delete borrowing
exports.deleteBorrowing = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const { id } = req.params

    const borrowing = await Borrowing.findByPk(id)

    if (!borrowing) {
      return res.status(404).json({ message: "Emprunt non trouvé" })
    }

    // If book is not returned, update book available quantity
    if (!borrowing.returnDate) {
      const book = await Book.findByPk(borrowing.bookId)

      if (book) {
        await book.update({
          availableQuantity: book.availableQuantity + 1,
        })
      }
    }

    await borrowing.destroy()

    res.status(200).json({ message: "Emprunt supprimé avec succès" })
  } catch (error) {
    console.error("Delete borrowing error:", error)
    res.status(500).json({ message: "Erreur lors de la suppression de l'emprunt" })
  }
}
