import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import cors from "cors"
import dotenv from "dotenv"

import user from "./routes/user.js"

const app = express()

dotenv.config()

app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(cors())

app.use("/user", user)

// to check if backend is not crashed
app.get("/", (req, res) => {
  res.send(`Server launched perfectly on ${req.protocol}://${req.get('host')}${req.originalUrl}`)
});

const CONNECTION_URL = process.env.CONNECTION_URL
const PORT = process.env.PORT || 5000

mongoose.connect(CONNECTION_URL)
  .then(() => app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port: ${PORT}`)))
  .catch((error) => console.log(error.message))