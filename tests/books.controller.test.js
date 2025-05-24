const { Book, Category } = require("../src/models")
const booksController = require("../src/controllers/books")

// Mock des modules
jest.mock("../src/models", () => ({
  Book: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Category: {
    findByPk: jest.fn(),
  },
}))

describe("Books Controller", () => {
  let req, res

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup request and response
    req = {
      params: {},
      query: {},
      body: {},
      user: { role: "admin" },
    }

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
  })

  describe("getAllBooks", () => {
    test("should return all books", async () => {
      // Mock Book.findAll to return books
      const mockBooks = [
        {
          id: 1,
          title: "Test Book 1",
          author: "Author 1",
          categoryId: 1,
          quantity: 5,
          availableQuantity: 3,
          Category: { id: 1, name: "Fiction" },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: "Test Book 2",
          author: "Author 2",
          categoryId: 2,
          quantity: 3,
          availableQuantity: 3,
          Category: { id: 2, name: "Non-Fiction" },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      Book.findAll.mockResolvedValue(mockBooks)

      await booksController.getAllBooks(req, res)

      expect(Book.findAll).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: "Test Book 1",
            categoryName: "Fiction",
            available: true,
          }),
          expect.objectContaining({
            id: 2,
            title: "Test Book 2",
            categoryName: "Non-Fiction",
            available: true,
          }),
        ]),
      )
    })

    test("should filter books by title", async () => {
      req.query.title = "Test"

      await booksController.getAllBooks(req, res)

      expect(Book.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: expect.anything(),
          }),
        }),
      )
    })
  })

  describe("createBook", () => {
    //test("should return 403 if user is not admin", async () => {
      //req.user.role = "student"

      //await booksController.createBook(req, res)

      //expect(res.status).toHaveBeenCalledWith(403)
      //expect(res.json).toHaveBeenCalledWith({ message: "Accès non autorisé" })
    //})

    test("should return 400 if required fields are missing", async () => {
      req.body = { author: "Author" } // Missing title and categoryId

      await booksController.createBook(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ message: "Titre, auteur et catégorie sont requis" })
    })

    test("should return 400 if category does not exist", async () => {
      req.body = {
        title: "New Book",
        author: "New Author",
        categoryId: 999,
      }

      // Mock Category.findByPk to return null
      Category.findByPk.mockResolvedValue(null)

      await booksController.createBook(req, res)

      expect(Category.findByPk).toHaveBeenCalledWith(999)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ message: "Catégorie non trouvée" })
    })

    test("should create a book successfully", async () => {
      req.body = {
        title: "New Book",
        author: "New Author",
        categoryId: 1,
        quantity: 2,
      }

      // Mock Category.findByPk to return a category
      Category.findByPk.mockResolvedValue({ id: 1, name: "Fiction" })

      // Mock Book.create to return a new book
      const mockNewBook = {
        id: 3,
        title: "New Book",
        author: "New Author",
        categoryId: 1,
        quantity: 2,
        availableQuantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      Book.create.mockResolvedValue(mockNewBook)

      await booksController.createBook(req, res)

      expect(Category.findByPk).toHaveBeenCalledWith(1)
      expect(Book.create).toHaveBeenCalledWith({
        title: "New Book",
        author: "New Author",
        categoryId: 1,
        quantity: 2,
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 3,
          title: "New Book",
          author: "New Author",
        }),
      )
    })
  })

  // Vous pouvez ajouter d'autres tests pour getBookById, updateBook, deleteBook
})
