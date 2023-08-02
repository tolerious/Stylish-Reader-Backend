const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSettingSchema = new Schema(
  {
    userID: ObjectId,
    defaultGroupID: ObjectId,
  },
  {
    statics: {
      async getUserByUserName(username) {
        return await mongoose.model("UserSetting", userSettingSchema).find({
          username: username,
        });
      },
    },
  }
);
const userSettingModel = mongoose.model("UserSetting", userSettingSchema);

module.exports = { userSettingModel };
