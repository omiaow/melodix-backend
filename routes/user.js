import { userAuth } from "../middleware/auth.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import express from "express"

import users from "../models/users.js"
import tasks from "../models/tasks.js"
import completeds from "../models/completeds.js"
import farms from "../models/farms.js"
 
const router = express.Router()

dotenv.config()

const invited = async (friendId) => {
    const user = await users.findById(friendId)

    if (user) {
        user.friends += 1
        user.coinsByFriends += 8
        user.coins += 8

        const userFilter = { _id: user._id }
        
        await users.updateOne(userFilter, user)

        if (user.invitedBy) {
            const parent = await users.findById(user.invitedBy)
    
            if (parent) {

                parent.coinsByFriends += 2.5
                parent.coins += 2.5
        
                const parentFilter = { _id: parent._id }
                
                await users.updateOne(parentFilter, parent)
            }
        }
    }
}

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { invitedBy, userId, name, username, isBot, language } = req.body

        if (!(userId && name && username && language && isBot === "false")) {
            return res.status(400).json({ status: false, message: "You can't login!" })
        }

        const user = await users.findOne({ tgUserId: userId })

        if (user) {
            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_USER_AUTH,
                { expiresIn: "3h" }
            )
            
            return res.json({ status: true, token: token })
        } else {
            const newUser = new users({
                invitedBy,
                tgUserId: userId,
                name,
                username,
                language,
                friends: 0,
                coinsByFriends: 0,
                coins: 80,
                currency: process.env.CURRENCY,
                wallet: "none",
                status: "active"
            })
            
            await newUser.save()

            if (invitedBy) {
                await invited(invitedBy)
            }

            // define UTC time
            const currentDate = new Date()
            const utcYear = currentDate.getUTCFullYear()
            const utcMonth = currentDate.getUTCMonth() + 1
            const utcDay = currentDate.getUTCDate()
            const utcHours = currentDate.getUTCHours()
            const utcMinutes = currentDate.getUTCMinutes()
            const utcSeconds = currentDate.getUTCSeconds()
            const utcDateTime = `${utcYear}-${utcMonth.toString().padStart(2, '0')}-${utcDay.toString().padStart(2, '0')}T${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}:${utcSeconds.toString().padStart(2, '0')}Z`

            const newFarm = new farms({
                userId: newUser.id,
                updateTime: utcDateTime,
                reward: 80,
                currency: process.env.CURRENCY
            })
            
            await newFarm.save()
            
            const token = jwt.sign(
                { id: newUser.id },
                process.env.JWT_USER_AUTH,
                { expiresIn: "3h" }
            )

            return res.json({ status: true, token: token, user: newUser })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ status: false, message: "Something went wrong, please try it againg!", error: e.message })
    }
})

// GET LIST OF TASKS
router.get("/tasks", userAuth, async (req, res) => {
    try {
        const list = await tasks.find({ status: "active" })

        res.json({ status: true, tasks: list })
    } catch (e) {
        res.status(500).json({ status: false, message: "Something went wrong, please try it againg!", error: e.message })
    }
})

// GET LIST OF COMPLETEDS
router.get("/completeds", userAuth, async (req, res) => {
    try {
        const list = await completeds.find({ userId: req.character.id })

        res.json({ status: true, completeds: list })
    } catch (e) {
        res.status(500).json({ status: false, message: "Something went wrong, please try it againg!", error: e.message })
    }
})

// GET FARM
router.get("/farm", userAuth, async (req, res) => {
    try {
        const farm = await farms.findOne({ userId: req.character.id })
        const user = await users.findById(req.character.id)

        res.json({ status: true, farm: farm, user: user })
    } catch (e) {
        res.status(500).json({ status: false, message: "Something went wrong, please try it againg!", error: e.message })
    }
})

// UPDATE FARM
router.put("/farm", userAuth, async (req, res) => {
    try {
        
        const user = await users.findById(req.character.id)

        const farm = await farms.findOne({ userId: req.character.id })

        // define UTC time
        const currentDate = new Date()
        const utcYear = currentDate.getUTCFullYear()
        const utcMonth = currentDate.getUTCMonth() + 1
        const utcDay = currentDate.getUTCDate()
        const utcHours = currentDate.getUTCHours()
        const utcMinutes = currentDate.getUTCMinutes()
        const utcSeconds = currentDate.getUTCSeconds()
        const utcDateTime = `${utcYear}-${utcMonth.toString().padStart(2, '0')}-${utcDay.toString().padStart(2, '0')}T${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}:${utcSeconds.toString().padStart(2, '0')}Z`
        
        const updateDifference = new Date(utcDateTime).getTime() - new Date(farm.updateTime).getTime()
        const millisecondsToEightHours = (1000 * 60 * 60 * 8)

        if (updateDifference < millisecondsToEightHours) {
            return res.status(200).json({ status: false, message: "Eight hours is not passed yet!" }) 
        }

        user.coins +=  farm.reward
        
        const userFilter = { _id: user._id }
        
        await users.updateOne(userFilter, user)
        
        farm.updateTime = utcDateTime

        const farmFilter = { _id: farm._id }
        
        await farms.updateOne(farmFilter, farm)

        res.json({ status: true, farm: farm })
    } catch (e) {
        res.status(500).json({ status: false, message: "Something went wrong, please try it againg!", error: e.message })
    }
})

// GET ALL FRIENDS
router.get("/friends", userAuth, async (req, res) => {
    try {
        const friends = await users.find({ invitedBy: req.character.id })
        const user = await users.findById(req.character.id)

        res.json({ status: true, friends: friends, user: user })
    } catch (e) {
        res.status(500).json({ status: false, message: "Something went wrong, please try it againg!", error: e.message })
    }
})

// CREATE COMPLETED
router.post("/completeds", userAuth, async (req, res) => {
    try {
        const { taskId } = req.body

        const completed = new completeds({
            taskId: taskId,
            userId: req.character.id,
            reward: 80,
            currency: "MP"
        })
        
        await completed.save()

        const user = await users.findById(req.character.id)

        user.coins += 80

        const userFilter = { _id: user._id }
        
        await users.updateOne(userFilter, user)

        res.json({ status: true, message: "Successfully completed!" })
    } catch (e) {
        res.status(500).json({ status: false, message: "Something went wrong, please try it againg!", error: e.message })
    }
})

// ADD WALLET
router.post("/wallet", userAuth, async (req, res) => {
    try {
        const { wallet } = req.body

        const user = await users.findById(req.character.id)

        user.wallet = wallet

        const userFilter = { _id: user._id }
        
        await users.updateOne(userFilter, user)

        res.json({ status: true, message: "Successfully added!" })
    } catch (e) {
        res.status(500).json({ status: false, message: "Something went wrong, please try it againg!", error: e.message })
    }
})

// ADD POINTS
router.put("/points", userAuth, async (req, res) => {
    try {
        const { points } = req.body

        const user = await users.findById(req.character.id)

        user.coins += points

        const userFilter = { _id: user._id }
        
        await users.updateOne(userFilter, user)

        res.json({ status: true, message: "Successfully added!" })
    } catch (e) {
        res.status(500).json({ status: false, message: "Something went wrong, please try it againg!", error: e.message })
    }
})


export default router