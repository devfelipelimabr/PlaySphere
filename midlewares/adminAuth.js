function adminAuth(req, res, next) {
    if (req.session.user != undefined) {
      next();
    } else {
      res.statusCode = 401
      return res.send(
        '<script>alert("Usuário deslogado. Faça login para ter acesso a este recurso."); window.location.href = "/login";</script>'
      );
    }
  }
  
  module.exports = adminAuth;
  