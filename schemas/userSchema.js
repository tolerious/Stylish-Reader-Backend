const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: String,
    password: String,
    /** 注册来源，默认是web */
    source: { type: String, default: "web" },
    /** 登陆后的token */
    token: { type: String, default: "" },
  },
  {
    timestamps: true,
    statics: {
      async getUserByUserName(username) {
        return await mongoose.model("User", userSchema).find({
          username: username,
        });
      },
    },
  }
);
const userModel = mongoose.model("User", userSchema);

module.exports = { userModel };
