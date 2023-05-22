const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const adminAuth = require("../midlewares/adminAuth");

router.get("/admin/users/new", adminAuth, (req, res) => {
  res.render("admin/users/new");
});

router.post("/user", adminAuth, (req, res) => {
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

router.post("/user/delete", adminAuth, (req, res) => {
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

router.get("/admin/user/edit/:id", adminAuth, (req, res) => {
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

router.post("/user/update", adminAuth, (req, res) => {
  const id = req.body.id;
  const fullName = req.body.fullName;
  const email = req.body.email;
  const password = req.body.password;

  // Criptografia da nova senha do usuário
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  User.findByPk(id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(404); // Usuário não encontrado
      }

      if (fullName != undefined && fullName != null && fullName != "") {
        user.fullName = fullName;
      }

      if (email != undefined && email != null && email != "") {
        user.email = email;
      }

      if (password != undefined && password != null && password != "") {
        user.password = hash;
      }

      return user.save();
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error("Erro ao atualizar usuário:", err);
      res.sendStatus(500);
    });
});

router.get("/login", (req, res) => {
  res.render("admin/users/login");
});

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email == undefined || password == undefined) {
    return res.sendStatus(400);
  }

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
          res.sendStatus(200);
        }
      });
    } else {
      res.sendStatus(404);
    }
  });
});

router.post("/logout", (req, res) => {
  req.session.user = undefined;
  res.sendStatus(200);
});

module.exports = router;
