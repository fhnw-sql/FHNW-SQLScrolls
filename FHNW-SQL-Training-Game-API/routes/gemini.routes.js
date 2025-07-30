const express = require("express");
const router = express.Router();
const db = require("../utils/db.js");
const { ObjectID } = require("mongodb");
const utils = require("../utils/renderPrompt.js");
const prompt = require("../prompts/prompt.js");

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const modelGemini = process.env.GEMINI_MODEL;

const cors = require("cors");
const logger = require("../utils/logger.js");

router.use(cors());

// POST /gemini/hint endpoint
async function hintHandler(req, res, next) {

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
    if (!user.history) {
      return res.status(400).json({ error: "User history not found." });
    }

    const { input, answer } = req.body;

    const filled_developer = utils.renderPrompt(prompt.developer, {
      item: { input, answer },
    });

    const filled_user = utils.renderPrompt(prompt.user, {
      item: { input, answer },
    });

    let fullContent = ""; // Log the full response for debugging

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({ model: modelGemini });

    logger.info(`Gemini stream started using @google/generative-ai SDK for model=${modelGemini}`);

    const request = {
      contents: [
        {
          role: "user",
          parts: [{ text: `Developer instructions: ${filled_developer}\n\nUser query: ${filled_user}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    };

    const streamingResponse = await geminiModel.generateContentStream(request);

    for await (const chunk of streamingResponse.stream) {

      const delta = chunk.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (delta) {
        fullContent += delta;
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }

    logger.info(`Full LLM streamed response (for debugging): ${fullContent}`);
    res.write("event: done\n\n");
    res.end();

    logger.info(`\ninput: ${input}\nanswer: ${answer}\nmodel: ${modelGemini} called`);
  } catch (error) {
    logger.error("Error in /gemini/hint:", error);
    res.write(`event: error\ndata: ${JSON.stringify({ message: `Something went wrong with Gemini.` })}\n\n`);
    res.end();
  }
};

router.post("/hint", hintHandler);

module.exports = { router, hintHandler };