import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.use(function (req, res, next) {
    const token = req.headers[global.constants.ACCESS_TOKEN_IDENTIFIER];
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

export default router;