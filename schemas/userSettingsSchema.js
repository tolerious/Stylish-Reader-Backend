const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const { Schema } = mongoose;

/**
 * 用户设置
 */
const userSettingSchema = new Schema(
  {
    userID: ObjectId,
    /** 默认单词组，即当前正在背诵的单词所属于的单词组 */
    defaultGroupID: ObjectId,
  },
  {
    timestamps: true,
    statics: {
      // FIXME: 这个函数应该在UserSchema中
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
