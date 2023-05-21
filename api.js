const SensitiveData = require("./secretData/secretDataBase");
const express = require("express");
const api = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const session = require("express-session");
const adminAuth = require("./midlewares/adminAuth");
const { default: slugify } = require("slugify");
const port = 5678;

// Configuração das sessões-------------------------------------------------------
api.use(
    session({
      secret: SensitiveData.session.secret,
      cookie: { maxAge: 10000000 }, // Tempo em milissegundos
    })
  );

  // Importação dos modelos-------------------------------------------------------
const Game = require("./models/Game");
const Category = require("./models/Category");
const User = require("./models/User");

// Configuração do body-parser-------------------------------------------------------
api.use(bodyParser.urlencoded({ extended: false }));
api.use(bodyParser.json());


// Autenticação com o banco de dados-------------------------------------------------------
connection
  .authenticate()
  .then(() => {
    console.log("Database connection successful!");
  })
  .catch((error) => {
    console.log(error);
  });



//API-------------------------------------------------------
api.get("/games", (req, res) => {
    res.statusCode = 200;
    Game.findAll({
      include: [{ model: Category }],
    }).then((games) => {
      res.send(games);
      res.statusCode = 200;
    });
  });
  
  api.get("/categories", (req, res) => {
    res.statusCode = 200;
    Category.findAll().then((categories) => {
      res.send(categories);
      res.statusCode = 200;
    });
  });
  
  api.get("/game/:id", (req, res) => {
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
  
  api.post("/game", adminAuth, (req, res) => {
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
  
  api.delete("/game/:id", adminAuth, (req, res) => {
    const id = req.params.id;
  
    if (isNaN(id)) {
      return res.sendStatus(400);
    }
  
    Game.findByPk(id).then((id) => {
      if (id != undefined) {
        Game.destroy({
          where: {
            id: id,
          },
        }).then(() => {
          res.sendStatus(200);
        });
      } else {
        res.sendStatus(404);
      }
    });
  });
  
  api.put("/game/:id", adminAuth, (req, res) => {
    const id = req.params.id;
  
    if (isNaN(id)) {
      return res.sendStatus(400);
    } else {
      Game.findByPk(id).then((game) => {
        if (game == undefined) {
          return res.sendStatus(404);
        } else {
          const { imageUrl, title, year, price, categoryId } = req.body;
          const slug = slugify(title);
  
          if (
            imageUrl != undefined &&
            title != undefined &&
            year != undefined &&
            price != undefined &&
            categoryId != undefined &&
            slug != undefined &&
            imageUrl != "" &&
            title != "" &&
            year != "" &&
            price != "" &&
            categoryId != "" &&
            slug != ""
          ) {
            Game.update(
              {
                imageUrl: imageUrl,
                title: title,
                slug: slug,
                year: year,
                price: price,
                categoryId: categoryId,
              },
              { where: { id: id } }
            );
            res.sendStatus(200);
          } else {
            res.sendStatus(400);
          }
        }
      });
    }
  });

  api.listen(port, () => {
    console.log(`The server is connected on port - ${port}`);
  });