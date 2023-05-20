const express = require("express");
const slugify = require("slugify");
const router = express.Router();
const Game = require("../models/Game");
const Category = require("../models/Category");
const adminAuth = require("../midlewares/adminAuth");

router.get("/admin/games", adminAuth, (req, res) => {
  Article.findAll({
    include: [{ model: Category }],
  }).then((games) => {
    res.render("admin/games/index", {
      games: games,
    });
  });
});

router.get("/admin/games/new", adminAuth, (req, res) => {
  Category.findAll({
    order: [["title", "ASC"]],
  }).then((categories) => {
    res.render("admin/games/new", { categories: categories });
  });
});

router.post("/games/save", adminAuth, (req, res) => {
  if (req.session.user === undefined) {
    return res.send(
      '<script>alert("Usuário deslogado"); window.location.href = "/login";</script>'
    );
  }
  const title = req.body.title;
  const body = req.body.body;
  const categoryId = req.body.category;
  if (title != undefined && body != undefined) {
    Article.create({
      title: title,
      slug: slugify(title),
      body: body,
      categoryId: categoryId,
    }).then(() => {
      res.redirect("/admin/games");
    });
  } else {
    res.redirect("admin/games/new");
  }
});

router.post("/games/delete", adminAuth, (req, res) => {
  const id = req.body.id;
  if (id != undefined && id != isNaN) {
    Article.destroy({
      where: {
        id: id,
      },
    }).then(() => {
      res.redirect("/admin/games");
    });
  } else {
    res.redirect("/admin/games");
  }
});

router.get("/admin/games/edit/:id", adminAuth, (req, res) => {
  const id = req.params.id;

  if (isNaN(id)) {
    return res.redirect("/admin/games");
  }

  Article.findByPk(id)
    .then((article) => {
      if (article != undefined) {
        Category.findAll({
          order: [["title", "ASC"]],
        }).then((categories) => {
          res.render("admin/games/edit", {
            article: article,
            categories: categories,
          });
        });
      } else {
        res.redirect("/admin/games");
      }
    })
    .catch((err) => {
      res.redirect("/admin/games");
    });
});

router.post("/games/update", adminAuth, (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const body = req.body.body;
  const categoryId = req.body.category;

  Article.update(
    { title: title, slug: slugify(title), body: body, categoryId: categoryId },
    {
      where: {
        id: id,
      },
    }
  )
    .then(() => {
      res.redirect("/admin/games");
    })
    .catch((err) => {
      res.redirect("/");
    });
});

router.get("/games/page/:num", (req, res) => {
  let page = parseInt(req.params.num);
  const limit = 5; // Número máximo de artigos por página
  let offset = 0; // Número de "bypass" de artigos

  if (isNaN(page) || page <= 1) {
    offset = 0;
    page = 1;
  } else {
    offset = (page - 1) * limit;
  }

  Article.findAndCountAll({
    limit: limit,
    offset: offset,
    order: [["id", "DESC"]],
  }).then((games) => {
    let next;
    offset + limit >= games.count ? (next = false) : (next = true);
    let prev;
    page <= 1 ? (prev = false) : (prev = true);

    const result = {
      page: page,
      next: next,
      prev: prev,
      games: games,
    };

    Category.findAll({
      order: [["title", "ASC"]],
    })
      .then((categories) => {
        if (page == 1) {
          res.redirect("/");
        } else {
          res.render("admin/games/page", {
            result: result,
            categories: categories,
          });
        }
      })
      .catch((err) => {
        res.redirect("/");
      });
  });
});

module.exports = router;
