require("dotenv/config");
const fs = require("node:fs");
const readline = require("node:readline/promises");
const Mustache = require("mustache");
const OpenAI = require("openai");
const prompt = require("../prompts/prompt.js");

const openaiGemini = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const MODEL = "gemini-2.5-flash";
const INPUT_FILE = "evals/testdata/big_set.jsonl";
const OUTPUT_FILE = "evals/testdata/big_set_with_2.5gemini.jsonl";

async function main() {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rl = readline.createInterface({ input: fs.createReadStream(INPUT_FILE), crlfDelay: Infinity });
  const out = fs.createWriteStream(OUTPUT_FILE, { flags: "w" });

  for await (const line of rl) {
    if (!line.trim()) continue;

    const raw = JSON.parse(line);
    const base = raw.item ?? raw;

    const systemPrompt = Mustache.render(prompt.developer, { item: base });

    try {
      const res = await openaiGemini.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt.user }
        ],
      });

      const gemini_output =
        res.choices?.[0]?.message?.content?.trim() ?? "";

      const outputItem = { ...base, gemini_output };
      out.write(JSON.stringify({ item: outputItem }) + "\n");
      await sleep(10000);

    } catch (err) {
      console.error("Gemini error:", err);

      if (err.status === 429) {
        console.log("429 hit, backing off 10s and retrying…");
        await sleep(10000);
        try {
          const retry = await openaiGemini.chat.completions.create({
            model: MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt.user }
            ],
          });
          const gemini_output = retry.choices?.[0]?.message?.content?.trim() ?? "";
          const outputItem = { ...base, gemini_output };
          out.write(JSON.stringify({ item: outputItem }) + "\n");
          await sleep(10000);
          continue;
        } catch {
          console.error("Retry failed");
        }
      }

      const outputItem = { ...base, gemini_output: "" };
      out.write(JSON.stringify({ item: outputItem }) + "\n");
      await sleep(10000);
    }
  }

  out.end(() => console.log(`Success: Done – results in ${OUTPUT_FILE}`));
}

main().catch(console.error);