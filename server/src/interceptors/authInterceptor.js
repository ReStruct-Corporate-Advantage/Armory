var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");

router.use(function (req, res, next) {
    var token = req.cookies[global.constants.ACCESS_TOKEN_IDENTIFIER];
    if (token) {
      jwt.verify(token,
        global.config.auth.secretKey,
        {algorithm: global.config.auth.algorithm},
        function (err, decoded) {
          if (err) {
            let errordata = {
              message: err.message,
              expiredAt: err.expiredAt
            };
            console.log(errordata);
            return res.status(401).json({
              message: "Unauthorized Access"
            });
          }
          req.decoded = decoded;
          next();
        });
    } else {
      return res.status(403).json({
        message: "Forbidden Access"
      });
    }
});

module.exports = router;