import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { OpenAI } from "openai";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs"; 

//to use dotenv variables
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const port = process.env.SERVER_PORT  || 5000;

//initialize express application
const app = express();
app.use(cors());//to make those cross origin requests & allow server to be called from frontend
app.use(express.json());//to pass json from frontend to backend


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../client/dist"))); // or build folder

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

// app.get("/", async(req, res) => {
//     res.status(200).send({
//         message: "Hello from ProblemSolver",
//     })
// });

app.post("/api/chat", async(req, res) => {
    try{
        const prompt = req.body.prompt;
        
        fs.readFile('faq.txt', 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return res.status(500).send('Error reading file');
            }

            console.log("data", data)
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                    role: "system",
                    content: `
                        You are a helpful online shipping customer service AI chatbot that only answers questions based on provided FAQ documents with friendly tones.
                        If the answer is not in the context, do NOT make up information. 
                        Instead, politely say that you don’t have the information but offer to help with other questions.
                    `
                    },
                    { role: "user", content: `Context: ${data}\n\nQuestion: ${prompt}` }],
                // stream: true,
                temperature: 0, // higher values = model takes more risk, 0 as we want it answer what it knows
                max_tokens: 1000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
                top_p: 1, // alternative to sampling with temperature, called nucleus sampling
                frequency_penalty: 0.5, // -2.0 <= number <= 2.0. not going to repeat similar sentences too often
                presence_penalty: 0, // -2.0 <= number <= 2.0. increasing the model's likelihood to talk about new topics.
            });
            
            console.log("response", response);
            res.status(200).send({
                bot: response.choices[0].message.content
            });
        });

  } catch (error) {
        console.error(error)
        res.status(500).send(error || 'Something went wrong');
  }
})

app.listen(port, () => console.log("Server is running on port http://localhost:5000"));