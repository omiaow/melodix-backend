import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const auth = (req, res, next, secretKey) => {
  if (req.method === "OPTIONS") {
    return next()
  }

  try {

    const token = req.headers["authorization"].split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: "No authorization" })
    }

    const decoded = jwt.verify(token, secretKey)
    req.character = decoded
    next()

  } catch (e) {
    return res.status(401).json({ message: "No authorization" })
  }
}

export const adminAuth = (req, res, next) => {
    return auth(req, res, next, process.env.JWT_ADMIN_AUTH)
}

export const userAuth  = (req, res, next) => {
    return auth(req, res, next, process.env.JWT_USER_AUTH)
}