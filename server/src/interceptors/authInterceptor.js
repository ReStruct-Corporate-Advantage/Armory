import express from "express";
import jwt from "jsonwebtoken";
import logger from "./../loaders/logs-loader.js";

const router = express.Router();

router.use(function (req, res, next) {
  logger.info("[AuthInterceptor] Initiating token verification");
  const token = req.headers[global.constants.ACCESS_TOKEN_IDENTIFIER];
  if (token) {
    logger.info("[AuthInterceptor] Token is available, proceeding with verification");
    jwt.verify(token,
      global.config.auth.secretKey,
      {algorithm: global.config.auth.algorithm},
      function (err, decoded) {
        if (err) {
          let errordata = {
            message: err.message,
            expiredAt: err.expiredAt
          };
          logger.error("[AuthInterceptor] Token is invalid or has expired, details: ", errordata);
          return res.status(401).json({
            message: "Unauthorized Access"
          });
        }
        logger.info("[AuthInterceptor] Token verified successfully!");
        req.decoded = decoded;
        next();
      });
  } else {
    logger.error("[AuthInterceptor] Token not present in the request");
    return res.status(403).json({
      message: "Forbidden Access"
    });
  }
});

export default router;