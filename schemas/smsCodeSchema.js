const mongoose = require("mongoose");

const { Schema } = mongoose;

const smsCodeSchema = new Schema(
  {
    username: String,
    code: String,
  },

  {
    timestamps: true,
    statics: {
      async generateCode(username) {
        let t = Math.random().toFixed(4).toString().split(".")[1];
        let s = await smsCodeModel.findOneAndUpdate(
          { username },
          { code: t },
          { upsert: true, overwrite: true ,returnDocument:'after'}
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
