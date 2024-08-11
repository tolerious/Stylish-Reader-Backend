const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const phraseSchema = new Schema(
  {
    creator: ObjectId,
    en: String,
    groupId: ObjectId,
  },
  {
    timestamps: true,
    
  }
);

const phraseModel = mongoose.model("Phrase", phraseSchema);

module.exports = { phraseModel };
