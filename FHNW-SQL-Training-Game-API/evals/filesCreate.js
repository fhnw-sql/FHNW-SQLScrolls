require("dotenv/config");
const OpenAI = require("openai");
const fs = require("fs");

const openai = new OpenAI();

async function main() {
  const file = await openai.files.create({
    file: fs.createReadStream("evals/testdata/small_set.jsonl"),
    purpose: "evals",
  });

  console.log(file);
}

main();