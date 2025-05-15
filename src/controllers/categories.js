const { Category, Book } = require("../models")
const { Op } = require("sequelize")

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
      order: [["name", "ASC"]],
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params

    const category = await Category.findByPk(id)

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" })
    }

    res.status(200).json(category)
  } catch (error) {
    console.error("Get category error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération de la catégorie" })
  }
}

// Create category
exports.createCategory = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const { name } = req.body

    if (!name) {
      return res.status(400).json({ message: "Le nom de la catégorie est requis" })
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ where: { name } })

    if (existingCategory) {
      return res.status(400).json({ message: "Une catégorie avec ce nom existe déjà" })
    }

    const newCategory = await Category.create({ name })

    res.status(201).json(newCategory)
  } catch (error) {
    console.error("Create category error:", error)
    res.status(500).json({ message: "Erreur lors de la création de la catégorie" })
  }
}

// Update category
exports.updateCategory = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const { id } = req.params
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ message: "Le nom de la catégorie est requis" })
    }

    const category = await Category.findByPk(id)

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" })
    }

    // Check if another category with the same name exists
    const existingCategory = await Category.findOne({
      where: {
        name,
        id: { [Op.ne]: id },
      },
    })

    if (existingCategory) {
      return res.status(400).json({ message: "Une catégorie avec ce nom existe déjà" })
    }

    await category.update({ name })

    res.status(200).json(category)
  } catch (error) {
    console.error("Update category error:", error)
    res.status(500).json({ message: "Erreur lors de la mise à jour de la catégorie" })
  }
}

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès non autorisé" })
    }

    const { id } = req.params

    const category = await Category.findByPk(id)

    if (!category) {
      return res.status(404).json({ message: "Catégorie non trouvée" })
    }

    // Check if category has books
    const booksCount = await Book.count({ where: { categoryId: id } })

    if (booksCount > 0) {
      return res.status(400).json({
        message: "Cette catégorie ne peut pas être supprimée car elle contient des livres",
      })
    }

    await category.destroy()

    res.status(200).json({ message: "Catégorie supprimée avec succès" })
  } catch (error) {
    console.error("Delete category error:", error)
    res.status(500).json({ message: "Erreur lors de la suppression de la catégorie" })
  }
}
