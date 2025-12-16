// models/Listing.js
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  source: { type: String, default: "rainforest" },
  listingId: { type: String, required: true, unique: true, index: true },
  url: String,

  raw: { type: mongoose.Schema.Types.Mixed },

  analysis: { type: mongoose.Schema.Types.Mixed },

  normalized: {
    title: String,
    description: String,
    price: Number,
    photoCount: Number,
    sellerReviewAvg: Number,
    sellerReviewCount: Number,
    sellerTransactions: Number,
    refundPolicyText: String
  },

  lemonScore: Number,
  reasons: [String],

  fetchedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

listingSchema.index({ listingId: 1 });
listingSchema.index({ fetchedAt: -1 });

export default mongoose.model("Listing", listingSchema);
