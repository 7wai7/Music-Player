import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const rateArtistSchema = new mongoose.Schema({
    artist: { type: ObjectId, ref: "User", required: true },
    rater: { type: ObjectId, ref: "User", required: true },
    value: { type: Number, required: true, min: 1, max: 5 }
}, {
    timestamps: { createdAt: true, updatedAt: false }
})

rateArtistSchema.index({ artist: 1, rater: 1 }, { unique: true });

export default mongoose.model('ArtistRating', rateArtistSchema);