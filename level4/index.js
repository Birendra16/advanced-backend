import express from "express"
import dotenv from "dotenv"
import { GoogleGenAI } from "@google/genai"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatGroq } from "@langchain/groq"

dotenv.config()

const app = express()
const port = 5000

app.use(express.json())

// without langchain

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY
// })


// app.post("/ai", async (req, res) => {
//     const { input } = req.body
//     const response = await ai.models.generateContent({
//         model: "gemini-3.5-flash",
//         contents: [
//             {
//                 role: "system",
//                 parts: [{ text: "You are a assistant and your name is Ramu. If you don't know the answer then don't give incorrect answer" }]
//             },
//             {
//                 role: "user",
//                 parts: [{ text: input }]
//             }
//         ]
//     })

//     return res.status(200).json({ "ai:": response.text })
// })


// with langchain

const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    maxTokens: 100,
    maxRetries: 2
})

app.post("/ai", async (req, res) => {
    const { input } = req.body

    const response = await llm.invoke([
        {
            role: "system",
            content: "You are a assistant and your name is Ramu. If you don't know the answer then don't give incorrect answer"
        },
        {
            role: "human",
            content: input
        }
    ])

    return res.status(200).json({ "ai:": response.content })
})


app.get("/", (req, res) => {
    return res.json({ message: "hello from level 4" })
})

app.listen(port, () => {
    console.log("server started")
})