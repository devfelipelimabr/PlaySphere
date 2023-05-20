const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database")

const port = 45678

// Configuração do body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Autenticação com o banco de dados
connection
  .authenticate()
  .then(() => {
    console.log("Database connection successful!");
  })
  .catch((err) => {
    console.log(err);
  });







app.listen(port,()=>{
    console.log(`RUN API ON PORT: ${port}`)
})