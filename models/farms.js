import mongoose from "mongoose"

const farmSchema = mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: "users", required: true },
    updateTime: { type: String },
    reward: { type: Number, required: true },
    currency: { type: String, required: true }
})

const farms = mongoose.model("farms", farmSchema)

export default farms