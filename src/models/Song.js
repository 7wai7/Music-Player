import mongoose from "mongoose";
const ObjectId = mongoose.Schema.Types.ObjectId;

const songSchema = new mongoose.Schema({
    user: { type: ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    lyrics: { type: String, maxlength: 5000 },
    createDate: { type: Date },
    size: { type: Number, required: true },
    duration: { type: Number, required: true },
    auditioning: { type: Number, default: 0 },
    genre: { type: String },
}, {
    timestamps: true
})

export default mongoose.model('Song', songSchema);