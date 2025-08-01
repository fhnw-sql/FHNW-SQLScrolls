const express = require("express");
const router = express.Router();
const db = require("../utils/db.js");
const { ObjectID } = require("mongodb");
const utils = require("../utils/renderPrompt.js");
const prompt = require("../prompts/prompt.js");

const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const modelGemini = process.env.GEMINI_MODEL;
const cors = require("cors");
const logger = require("../utils/logger.js");

router.use(cors());

// POST /gemini2/hint endpoint
async function hintHandler(req, res, next) {
    let fullContent = "";

    // Set Server Sent Event headers for streaming
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });
    res.flushHeaders();

    try {
        const users = db.get().collection("users");
        const user = await users.findOne({ _id: new ObjectID(req.user.userId) });
        if (!user || !user.history) {
            return res.status(400).json({ error: "User history not found." });
        }

        const { input, answer } = req.body;
        const filled_developer = utils.renderPrompt(prompt.developer, { item: { input, answer } });
        const filled_user = utils.renderPrompt(prompt.user, { item: { input, answer } });

        logger.info(`Gemini2 stream started for model=${modelGemini}`);

        const request = {
            model: modelGemini,
            contents: [
                {
                    role: "user",
                    parts: [{ text: `Developer instructions: ${filled_developer}\n\nUser query: ${filled_user}` }]
                }
            ],
            config: { thinkingConfig: { thinkingBudget: 0 } },
            generationConfig: {
                temperature: 1.0,
                topP: 0.95,
                topK: 64,
                candidateCount: 1,
            }
        };

        const stream = await ai.models.generateContentStream(request);
        for await (const chunk of stream) {
            const delta = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (delta) {
                fullContent += delta;
                res.write(`data: ${JSON.stringify({ delta })}\n\n`);
            }
        }

        res.write("event: done\n\n");
        res.end();

        logger.info(`Full Gemini2 response: ${fullContent}`);
        logger.info(`input=${input}, answer=${answer}, model=${modelGemini} called`);

    } catch (err) {
        logger.error("Error in /gemini2/hint:", err);
        res.write(`event: error\ndata: ${JSON.stringify({ message: "Something went wrong with Gemini2." })}\n\n`);
        res.end();
    }
};

router.post("/hint", hintHandler);
module.exports = { router, hintHandler };
