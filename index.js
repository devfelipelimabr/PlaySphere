const SensitiveData = require("./secretData/secretDataBase");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const session = require("express-session");
const adminAuth = require("./midlewares/adminAuth");
const port = 45678;

// Configuração das sessões-------------------------------------------------------
app.use(
  session({
    secret: SensitiveData.session.secret,
    cookie: { maxAge: 10000000 }, // Tempo em milissegundos
  })
);

// Importação dos controllers-------------------------------------------------------
const categoriesController = require("./controllers/CategoriesController");
const gamesController = require("./controllers/GamesController");
const userController = require("./controllers/UserController");

// Importação dos modelos-------------------------------------------------------
const Game = require("./models/Game");
const Category = require("./models/Category");
const User = require("./models/User");
const { default: slugify } = require("slugify");

// Configuração do mecanismo de visualização-------------------------------------------------------
app.set("view engine", "ejs");

// Servir arquivos estáticos-------------------------------------------------------
app.use(express.static("public"));

// Configuração do body-parser-------------------------------------------------------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Autenticação com o banco de dados-------------------------------------------------------
connection
  .authenticate()
  .then(() => {
    console.log("Database connection successful!");
  })
  .catch((error) => {
    console.log(error);
  });

// Uso dos controllers-------------------------------------------------------
app.use("/", categoriesController);
app.use("/", gamesController);
app.use("/", userController);

// Rotas-------------------------------------------------------
app.get("/", async (req, res) => {
  try {
    const games = await Game.findAll({
      order: [["id", "DESC"]],
      limit: 5,
    });
    const categories = await Category.findAll({
      order: [["title", "ASC"]],
    });
    res.render("index", { games, categories });
  } catch (error) {
    res.redirect("/");
  }
});

app.get("/about", async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.render("about", { categories });
  } catch (error) {
    res.redirect("/");
  }
});

app.get("/games/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const game = await Game.findOne({
      where: {
        slug: slug,
      },
    });
    if (game != undefined) {
      const categories = await Category.findAll({
        order: [["title", "ASC"]],
      });
      res.render("game", { game, categories });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect("/");
  }
});

app.get("/category/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const category = await Category.findOne({
      where: {
        slug: slug,
      },
      include: [{ model: Game }],
    });
    if (category != undefined) {
      const categories = await Category.findAll({
        order: [["title", "ASC"]],
      });
      res.render("index", {
        games: category.games,
        category,
        categories,
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect("/");
  }
});

//API-------------------------------------------------------
app.get("/games", (req, res) => {
  res.statusCode = 200;
  Game.findAll({
    include: [{ model: Category }],
  }).then((games) => {
    res.send(games);
    res.statusCode = 200;
  });
});

app.get("/categories", (req, res) => {
  res.statusCode = 200;
  Category.findAll().then((categories) => {
    res.send(categories);
    res.statusCode = 200;
  });
});

app.get("/game/:id", (req, res) => {
  const id = req.params.id;

  if (isNaN(id)) {
    res.sendStatus(400);
  } else {
    res.statusCode = 200;
    Game.findByPk(id).then((game) => {
      if (game != undefined) {
        res.send(game);
        res.statusCode = 200;
      } else {
        res.sendStatus(404);
      }
    });
  }
});

app.post("/game", adminAuth, (req, res) => {
  if (req.session.user === undefined) {
    return res.sendStatus(401);
  }
  const { imageUrl, title, year, price, categoryId } = req.body;
  const slug = slugify(title);

  if (
    imageUrl != undefined &&
    title != undefined &&
    year != undefined &&
    price != undefined &&
    categoryId != undefined &&
    slug != undefined
  ) {
    Game.create({
      imageUrl: imageUrl,
      title: title,
      slug: slug,
      year: year,
      price: price,
      categoryId: categoryId,
    });
    res.sendStatus(200);
  } else {
    return res.sendStatus(400);
  }
});

app.delete("/game/:id", adminAuth, (req, res) => {
  const id = req.params.id;
  if (id != undefined && id != isNaN) {
    Game.destroy({
      where: {
        id: id,
      },
    }).then(() => {
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(400);
  }
});

app.listen(port, () => {
  console.log(`The server is connected on port - ${port}`);
});
