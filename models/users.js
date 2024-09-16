import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    invitedBy: { type: mongoose.Types.ObjectId, ref: "users" },
    tgUserId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, required: true },
    language: { type: String, required: true },
    friends: { type: Number, required: true },
    coinsByFriends: { type: Number, required: true },
    coins: { type: Number, required: true },
    currency: { type: String, required: true },
    wallet: { type: String, required: true },
    status: { type: String, required: true }, // active or banned
})

const users = mongoose.model("users", userSchema)

export default users