const jwt = require("jsonwebtoken");
const { generateResponse } = require("../utils/utils");
const { userModel } = require("../schemas/userSchema");
const auth = function (req, res, next) {
  let rule = /daily*/i;
  let userRegisterRule = /user\/create/i;
  let smsRule = /sms/i;
  let userExistRule = /user\/exist/i;
  console.log(req.originalUrl);

  if (
    // TODO: This array should be a global array or a array in a global file
    (["/logic/login", "/test", "/grab", "/user/"].indexOf(req.originalUrl) >
      -1 &&
      (req.method === "POST" || req.method === "GET")) ||
    rule.test(req.originalUrl) ||
    userRegisterRule.test(req.originalUrl) ||
    smsRule.test(req.originalUrl) ||
    userExistRule.test(req.originalUrl)
  ) {
    next();
    return;
  }
  try {
    console.log(req.headers);
    let token = req.headers.authorization.replace(/bearer/i, "").trim();
    // TODO: string 'english-burning' can be a global or config variable
    if (!token || token === "null" || token === "undefined") {
      console.log("token is null");
      res.json(generateResponse("", 401, "user info not correct"));
      return;
    }
    jwt.verify(token, "english-burning", async (err, decode) => {
      if (err != null) {
        console.log("not login");
        res.json(generateResponse("", 401, "username or password not correct"));
        return;
      }
      let username = decode.data.username;
      let users = await userModel.getUserByUserName(username);
      if (users.length === 1) {
        req.tUser = users[0];
        next();
      } else {
        console.log("not login");
        res.json(generateResponse("", 401, "user info not correct"));
      }
    });
  } catch (error) {
    console.log("catch error in auth.js");
    res.json(generateResponse(error, 401, "user info not correct"));
  }
};

module.exports = auth;
