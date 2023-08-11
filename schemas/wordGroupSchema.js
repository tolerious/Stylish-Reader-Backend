const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const wordGroupSchema = new Schema(
  {
    userID: ObjectId,
    groupMediaUrl: String,
    name: { type: String, default: "" },
    wordCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    statics: {
      getMyGroup(userID) {
        return mongoose.model("WordGroup").find({ userID });
      },
    },
  }
);

const wordGroupModel = mongoose.model("WordGroup", wordGroupSchema);

module.exports = { wordGroupModel };
