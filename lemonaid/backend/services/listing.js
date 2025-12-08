// models/Listing.js
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  source: { type: String, default: "rainforest" },
  listingId: { type: String, required: true },
  url: String,

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

  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Listing", listingSchema);
