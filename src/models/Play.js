import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const playSchema = new mongoose.Schema({
    song: { type: ObjectId, ref: "Song", required: true }
}, {
    timestamps: { createdAt: true, updatedAt: false }
})

export default mongoose.model('Play', playSchema);