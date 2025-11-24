import mongoose from 'mongoose';

const { Schema } = mongoose;

const ListingSchema = new Schema({
  listingId: { type: String, required: true, index: true },
  raw: { type: Schema.Types.Mixed },
  analysis: { type: Schema.Types.Mixed },
  fetchedAt: { type: Date, default: () => new Date() }
});

export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
