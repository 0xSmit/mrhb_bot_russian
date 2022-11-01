const mongoose = require('mongoose');
let schema = new mongoose.Schema(
  {
    chatId: Number,
    messageId: Number,
    message: Object,
  },
  { versionKey: false, strict: false }
);

schema.index({ chatId: 1, message: 1 }, { unique: true });
module.exports = mongoose.model('logs', schema);
