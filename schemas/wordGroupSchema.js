const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const wordGroupSchema = new Schema(
  {
    userID: ObjectId,
    groupMediaUrl: String,
    groupAudioUrl: String,
    groupArticleUrl: String,
    parentGroupID: { type: String, default: '' },
    isPublic: { type: Boolean, default: false },
    name: { type: String, default: "" },
    wordCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    statics: {
      async isParentGroup(id) {
        let t = await mongoose.model('WordGroup').find({ parentGroupID: id })
        if (t.length > 0) return true
        return false
      },
      getMyGroup(userID) {
        return mongoose.model("WordGroup").find({ userID })
          .where('parentGroupID').equals('');
      },
    },
  }
);

const wordGroupModel = mongoose.model("WordGroup", wordGroupSchema);

module.exports = { wordGroupModel };
