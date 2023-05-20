const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs")
const adminAuth = require("../midlewares/adminAuth")

router.get("/admin/users/new", adminAuth, (req, res) => {  
  res.render("admin/users/new");
});

router.post("/users/save", adminAuth, (req, res) => {
  const fullName = req.body.fullName;
  const email = req.body.email;
  const password = req.body.password;

  //Criptografia da senha do usuário
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  User.findOne({ where: { email: email } })
    .then((emailConfirm) => {
      if (emailConfirm === null) {
        User.create({ fullName: fullName, email: email, password: hash })
          .then(() => {
            res.redirect("/admin/users");
          })
          .catch((err) => {
            // Lida com erros na criação do usuário
            console.error("Erro ao criar usuário: ", err);
            res.redirect("/admin/users/new");
          });
      } else {
        res.send(
          '<script>alert("Email já cadastrado."); window.location.href = "/admin/users/new";</script>'
        );
      }
    })
    .catch((err) => {
      console.error("Erro ao buscar email: ", err);
      res.redirect("/admin/users/new");
    });
});

router.get("/admin/users", adminAuth, (req, res) => {
  User.findAll().then((users) => {
    res.render("admin/users/index", {
      users: users,
    });
  });
});

router.post("/users/delete", adminAuth, (req, res) => {
  const id = req.body.id;
  if (id != undefined && id != isNaN) {
    User.destroy({
      where: {
        id: id,
      },
    }).then(() => {
      res.redirect("/admin/users");
    });
  } else {
    res.redirect("/admin/users");
  }
});

router.get("/admin/users/edit/:id", adminAuth, (req, res) => {
  const id = req.params.id;

  if (isNaN(id)) {
    return res.redirect("/admin/users");
  }

  User.findByPk(id)
    .then((user) => {
      if (user != undefined) {
        res.render("admin/users/edit", { user: user });
      } else {
        res.redirect("/admin/users");
      }
    })
    .catch((erro) => {
      res.redirect("/admin/users");
    });
});

router.post("/users/update", adminAuth, (req, res) => {  
  const fullName = req.body.fullName;
  const email = req.body.email;
  const password = req.body.password;

  //Criptografia da senha do usuário
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  User.findOne({ where: { email: email } })
    .then((emailConfirm) => {
      if (emailConfirm === null) {
        User.create({ fullName: fullName, email: email, password: hash })
          .then(() => {
            res.redirect("/admin/users");
          })
          .catch((err) => {
            // Lida com erros na criação do usuário
            console.error("Erro ao criar usuário: ", err);
            res.redirect("/admin/users/new");
          });
      } else {
        res.send(
          '<script>alert("Email já cadastrado."); window.location.href = "/admin/users/new";</script>'
        );
      }
    })
    .catch((err) => {
      console.error("Erro ao buscar email: ", err);
      res.redirect("/admin/users/new");
    });
});

router.get("/login", (req, res) => {
  res.render("admin/users/login");
});

router.post("/auth", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ where: { email: email } }).then((user) => {
    if (user !== null) {
      //Verifica se existe este email de usuário no BD
      bcrypt.compare(password, user.password, (err, correct) => {
        if (correct) {
          //Inicia sessão
          req.session.user = {
            id: user.id,
            email: user.email,
          };
          res.json(req.session.user);
        } 
      });
    }else {
      res.send(
        '<script>alert("Usuário ou senha incorretos"); window.location.href = "/login";</script>'
      );
    }
  });
});

router.get("/logout",(req,res)=>{
  req.session.user = undefined;
  res.send(
    '<script>alert("Usuário deslogado com sucesso!"); window.location.href = "/";</script>'
  );
})

module.exports = router;
