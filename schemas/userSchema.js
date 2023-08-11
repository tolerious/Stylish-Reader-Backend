const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: String,
    password: String,
    source: { type: String, default: "web" },
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
