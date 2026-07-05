import express from "express"
import dotenv from "dotenv"
import { GoogleGenAI } from "@google/genai"
dotenv.config()

const app = express()
const port = 5000

app.use(express.json())

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

app.post("/ai", async (req, res) => {
    const { input } = req.body
    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
            {
                role: "system",
                parts: [{ text: "You are a assistant and your name is Ramu. If you don't know the answer then don't give incorrect answer" }]
            },
            {
                role: "user",
                parts: [{ text: input }]
            }
        ]
    })

    return res.status(200).json({ "ai:": response.text })
})


app.get("/", (req, res) => {
    return res.json({ message: "hello from level 4" })
})

app.listen(port, () => {
    console.log("server started")
})