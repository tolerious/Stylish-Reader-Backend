const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const { Schema } = mongoose;

const feedBackSchema = new Schema({
  creator: ObjectId,
  content: String,
});

const feedBackModel = mongoose.model("Feedback", feedBackSchema);

module.exports = { feedBackModel };
