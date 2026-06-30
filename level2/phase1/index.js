import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import User from "./model/user.model.js"
import Redis from "ioredis"

dotenv.config()

const port = process.env.PORT || 5000

const app = express()
app.use(express.json())

const redis = new Redis(process.env.REDIS_URL)

app.get("/", (req,res)=>{
    return res.status(200).json({message:"Hello from redis"})
})

app.post("/create",async(req,res)=>{
    const {name,email,password}=req.body
    await redis.del("user:all")
    const user = await User.create({
        name,email,password
    })

    return res.json(user)
})

app.get("/get",async(req,res)=>{
    
    const user = await User.find({})

    return res.json(user)
})


app.get("/get-with-redis", async(req,res)=>{
    const cached = await redis.get("user:all")
    if(cached){
        const user = JSON.parse(cached)
        return res.json(user)
    }
     const user = await User.find({})
     await redis.set("user:all",JSON.stringify(user))

    return res.json(user)
})

app.listen(port,()=>{
    connectDB()
    console.log(`server started ${port}`)
})


//without redis ---- 67ms