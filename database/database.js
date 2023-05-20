const Sequelize = require("sequelize");
const secretData = require("../secretData/secretDataBase");
const connection = new Sequelize(
  "apigames",
  secretData.database.user,
  secretData.database.password,
  {
    host: "localhost",
    dialect: "mysql",
    timezone: "-03:00",
  }
);

module.exports = connection;
