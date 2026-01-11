const mongoose = require("mongoose");

const awarenessSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

module.exports = mongoose.model("Awareness", awarenessSchema);
