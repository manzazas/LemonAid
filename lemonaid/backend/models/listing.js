import mongoose from 'mongoose';

const { Schema } = mongoose;

const ListingSchema = new Schema({
  listingId: { type: String, required: true, index: true },
  raw: { type: Schema.Types.Mixed },
  analysis: { type: Schema.Types.Mixed },
  fetchedAt: { type: Date, default: () => new Date() }
});

// TTL index: expire cached entries after 7 days (adjust as needed)
ListingSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
