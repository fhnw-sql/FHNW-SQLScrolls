require("dotenv/config");
const OpenAI = require("openai");

async function runEval() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const run = await openai.evals.runs.create(
    "eval_6877e36d02488191a71580011dcc9593",
    {
      name: "Grading for gemini-2.5-flash, run2, no thinking, prompt2",
      data_source: {
        type: "jsonl",
        source: { type: "file_id", id: "file-TCf8T6CHL4QnrVp5u84DxT" }
      },
    }
  );

  console.log(run);
}

runEval().catch(console.error);
