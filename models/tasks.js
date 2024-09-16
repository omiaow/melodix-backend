import mongoose from "mongoose"

const taskSchema = mongoose.Schema({
    description: { type: String, required: true },
    type: { type: String, required: true },
    reward: { type: Number, required: true },
    currency: { type: String, required: true },
    link: { type: String, required: true },
    status: { type: String, required: true }, // active or expired
})

const tasks = mongoose.model("tasks", taskSchema)

export default tasks