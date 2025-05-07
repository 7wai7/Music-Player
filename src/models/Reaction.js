import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const reactionSchema = new mongoose.Schema({
    user: { type: ObjectId, ref: "User", required: true },
    song: { type: ObjectId, ref: "Song", default: null },
    reaction: { type: Boolean, required: true }, // true -> like, false -> dislike
}, { timestamps: true });

export default mongoose.model('Reaction', reactionSchema);
