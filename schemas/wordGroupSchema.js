const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const wordGroupSchema = new Schema(
  {
    name: { type: String, default: "Default" },
    isDefault: { type: Boolean, default: false },
    creator: ObjectId,
    groupDescription: { type: String, default: "Group description." },
    groupCoverUrl: { type: String, default: "" },
    groupVideoUrl: { type: String, default: "" },
    groupAudioUrl: { type: String, default: "" },
    groupArticleUrl: { type: String, default: "" },
    parentGroupID: { type: String, default: "" },
    isPublic: { type: Boolean, default: false },
    wordCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    statics: {
      getOnlyChildGroup(creator) {
        return mongoose
          .model("WordGroup")
          .find({ creator: creator, parentGroupID: { $ne: "" } });
      },
      getPublicGroup() {
        return mongoose
          .model("WordGroup")
          .find({ isPublic: true, parentGroupID: { $ne: "" } });
      },
      getOnlyParentGroup(creator) {
        return mongoose
          .model("WordGroup")
          .find({ creator })
          .where("parentGroupID")
          .equals("");
      },
    },
  }
);

const wordGroupModel = mongoose.model("WordGroup", wordGroupSchema);

module.exports = { wordGroupModel };
