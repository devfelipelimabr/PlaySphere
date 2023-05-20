const Sequelize = require("sequelize");
const connection = require("../database/database");
const Category = require("./Category")

const Game = connection.define("games", {
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  year: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  price: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  slug: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

Category.hasMany(Game); //Uma categoria tem muitos artigos, relacionamento 1 pra muitos
Game.belongsTo(Category); //Um artigo pertence a uma categoria, relacionamento 1 para 1

Game.sync({ force: false });

module.exports = Game;
