const { Book, Category } = require("../src/models")
const booksController = require("../src/controllers/books")

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
    jest.clearAllMocks()
    req = { params: {}, query: {}, body: {}, user: { role: "admin" } }
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
  })

  describe("getAllBooks", () => {
    test("renvoie tous les livres", async () => {
      Book.findAll.mockResolvedValue([
        { id: 1, title: "Book 1", Category: { name: "Fiction" }, availableQuantity: 2 },
        { id: 2, title: "Book 2", Category: { name: "Non-Fiction" }, availableQuantity: 1 },
      ])

      await booksController.getAllBooks(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalled()
    })

    test("filtre les livres par titre", async () => {
      req.query.title = "Book"
      await booksController.getAllBooks(req, res)

      expect(Book.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ title: expect.anything() }),
        }),
      )
    })
  })

  describe("createBook", () => {
    test("retourne 400 si champs manquants", async () => {
      req.body = { author: "Author" }
      await booksController.createBook(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    test("retourne 400 si catégorie inexistante", async () => {
      req.body = { title: "Book", author: "Author", categoryId: 999 }
      Category.findByPk.mockResolvedValue(null)

      await booksController.createBook(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    test("crée un livre avec succès", async () => {
      req.body = { title: "New Book", author: "Author", categoryId: 1, quantity: 2 }
      Category.findByPk.mockResolvedValue({ id: 1, name: "Fiction" })
      Book.create.mockResolvedValue({ id: 3, title: "New Book", author: "Author" })

      await booksController.createBook(req, res)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalled()
    })
  })
})
