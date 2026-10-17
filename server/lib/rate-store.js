const crypto = require("node:crypto");
const mongoose = require("mongoose");
const schema = new mongoose.Schema(
  { _id: String, hits: { type: Number, default: 0 }, expiresAt: Date },
  { versionKey: false, collection: "adhayan_rate_counters" },
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Counter = mongoose.model("RateCounter", schema);
class MongoRateStore {
  constructor(secret, prefix) {
    this.secret = secret;
    this.prefix = prefix;
    this.localKeys = false;
  }
  init(options) {
    this.windowMs = options.windowMs;
  }
  key(value) {
    const bucket = Math.floor(Date.now() / this.windowMs);
    return (
      `${this.prefix}:${bucket}:` +
      crypto.createHmac("sha256", this.secret).update(value).digest("hex")
    );
  }
  async increment(value) {
    const resetTime = new Date(
      (Math.floor(Date.now() / this.windowMs) + 1) * this.windowMs,
    );
    const _id = this.key(value);
    let doc;
    try {
      doc = await Counter.findOneAndUpdate(
        { _id },
        { $inc: { hits: 1 }, $setOnInsert: { expiresAt: resetTime } },
        { upsert: true, new: true },
      );
    } catch (e) {
      if (e.code !== 11000) throw e;
      doc = await Counter.findOneAndUpdate(
        { _id },
        { $inc: { hits: 1 } },
        { new: true },
      );
    }
    return { totalHits: doc.hits, resetTime };
  }
  async decrement(value) {
    await Counter.updateOne(
      { _id: this.key(value), hits: { $gt: 0 } },
      { $inc: { hits: -1 } },
    );
  }
  async resetKey(value) {
    await Counter.deleteOne({ _id: this.key(value) });
  }
}
module.exports = { MongoRateStore, Counter };
