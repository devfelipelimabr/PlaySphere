const express = require("express");
const slugify = require("slugify");
const router = express.Router();
const Category = require("../models/Category");
const adminAuth = require("../midlewares/adminAuth");

router.get("/admin/category/new", adminAuth, (req, res) => {
  res.render("admin/categories/new");
});

router.post("/category/save", adminAuth, (req, res) => {
  const title = req.body.title;

  if (title && title.trim() !== "") {
    // Verifica se o título não está vazio ou contém apenas espaços em branco
    Category.create({
      title: title,
      slug: slugify(title),
    })
      .then(() => {
        res.redirect("/admin/categories");
      })
      .catch((error) => {
        // Lida com erros na criação da categoria
        console.error("Erro ao criar categoria: ", error);
        res.redirect("/admin/category/new");
      });
  } else {
    res.redirect("/admin/category/new");
  }
});

router.get("/admin/categories", adminAuth, (req, res) => {
  Category.findAll().then((categories) => {
    res.render("admin/categories/index", {
      categories: categories,
    });
  });
});

router.post("/category/delete", adminAuth, (req, res) => {
  const id = req.body.id;
  if (id != undefined && id != isNaN) {
    Category.destroy({
      where: {
        id: id,
      },
    }).then(() => {
      res.redirect("/admin/categories");
    });
  } else {
    res.redirect("/admin/categories");
  }
});

router.get("/admin/category/edit/:id", adminAuth, (req, res) => {
  const id = req.params.id;

  if (isNaN(id)) {
    return res.redirect("/admin/categories");
  }

  Category.findByPk(id)
    .then((category) => {
      if (category != undefined) {
        res.render("admin/categories/edit", { category: category });
      } else {
        res.redirect("/admin/categories");
      }
    })
    .catch((erro) => {
      res.redirect("/admin/categories");
    });
});

router.post("/category/update", adminAuth, (req, res) => {
  const id = req.body.id;
  const title = req.body.title;

  Category.update(
    { title: title, slug: slugify(title) },
    {
      where: {
        id: id,
      },
    }
  ).then(() => {
    res.redirect("/admin/categories");
  });
});

module.exports = router;
