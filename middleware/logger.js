const loggerMiddleware = function (req, res, next) {
  console.log(`-----------------------------------
|  
|     API: ${req.originalUrl} called. Method: ${req.method}
|
-----------------------------------
  `);
  next();
};
module.exports = loggerMiddleware;
