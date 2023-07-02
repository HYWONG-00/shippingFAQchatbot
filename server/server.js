import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

//to use dotenv variables
dotenv.config();


const configuration =  new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

//initialize express application
const app = express();
app.use(cors());//to make those cross origin requests & allow server to be called from frontend
app.use(express.json());//to pass json from frontend to backend

app.get("/", async(req, res) => {
    res.status(200).send({
        message: "Hello from ProblemSolver",
    })
});

app.post("/", async(req, res) => {
    try{
        const prompt = req.body.prompt;

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`,
            temperature: 0, // higher values = model takes more risk, 0 as we want it answer what it knows
            max_tokens: 2000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
            top_p: 1, // alternative to sampling with temperature, called nucleus sampling
            frequency_penalty: 0.5, // -2.0 <= number <= 2.0. not going to repeat similar sentences too often
            presence_penalty: 0, // -2.0 <= number <= 2.0. increasing the model's likelihood to talk about new topics.
            });

        res.status(200).send({
            bot: response.data.choices[0].text
        });

  } catch (error) {
        console.error(error)
        res.status(500).send(error || 'Something went wrong');
  }
})

app.listen(5000, () => console.log("Server is running on port http://localhost:5000"));