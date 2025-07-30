const express = require("express");
const router = express.Router();
const db = require("../utils/db.js");
const { ObjectID } = require("mongodb");
const utils = require("../utils/renderPrompt.js");
const prompt = require("../prompts/prompt.js");
const OpenAI = require("openai");
const clientGemini = new OpenAI({ apiKey: process.env.GEMINI_API_KEY, baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" });
const clientOpenAI = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const modelGemini = process.env.GEMINI_MODEL
const modelOpenAI = process.env.OPENAI_MODEL
const whichLLM = (process.env.LLM)
const cors = require("cors");
const logger = require("../utils/logger.js");

router.use(cors())

// POST /ai/hint endpoint
async function hintHandler(req, res, next) {
  const isGemini = whichLLM === "gemini";
  const client = isGemini ? clientGemini : clientOpenAI;
  const model = isGemini ? modelGemini : modelOpenAI;

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
      item: { input, answer }
    });

    const filled_user = utils.renderPrompt(prompt.user, {
      item: { input, answer }
    });

    const stream = await client.chat.completions.create({
      model,
      messages: [
        { role: "developer", content: filled_developer },
        { role: "user", content: filled_user },
      ],
      stream: true
    });

    logger.info(`Hint stream started for model=${model}`);
    let fullContent = ""; // Log the full response for debugging

    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta?.content;
      if (delta) {
        fullContent += delta;
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }

    logger.info(`Full LLM streamed response (for debugging): ${fullContent}`);
    res.write("event: done\n\n");
    res.end();

    logger.info(`\ninput: ${input}\nanswer: ${answer}\nmodel: ${model} called`);

  } catch (error) {
    logger.error("Error in /ai/hint:", error);
    res.write(`event: error\ndata: ${JSON.stringify({ message: `Something went wrong with ${whichLLM}.` })}\n\n`);
    res.end();
  }
};

module.exports = router;

router.post("/hint", hintHandler);

module.exports = { router, hintHandler };