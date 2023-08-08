const mongoose = require("mongoose");

const { Schema } = mongoose;

const smsCodeSchema = new Schema(
  {
    username: String,
    code: String,
    createDate: { type: Date, default: Date.now },
    updateDate: { type: Date, default: Date.now },
  },

  {
    statics: {
      async generateCode(username) {
        let t = Math.random().toFixed(4).toString().split(".")[1];
        let s = await smsCodeModel.findOneAndUpdate(
          { username },
          { code: t },
          { upsert: true }
        );
        return s;
      },
    },
    virtuals: {
      basicInfo: {},
    },
    methods: {},
  }
);

const smsCodeModel = mongoose.model("smsCode", smsCodeSchema);

module.exports = { smsCodeModel };
