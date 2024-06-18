const loggerMiddleware = function (req, res, next) {
  console.log(`-----------------------------------
|  
|     API: ${req.originalUrl} called. Method: ${req.method}; Data: ${JSON.stringify(req.body)}
|
-----------------------------------
  `);
  next();
};
module.exports = loggerMiddleware;
