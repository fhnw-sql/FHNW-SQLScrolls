require("dotenv/config");
const OpenAI = require("openai");
const prompt = require("../prompts/prompt.js");

const openai = new OpenAI();

async function main() {
    try {
        const run = await openai.evals.runs.create("eval_687260e8bb3881919ec702b03770c7d4", {
            name: "TEST: Grading for gpt-4.1",
            data_source: {
                type: "completions",
                model: "gpt-4.1",
                input_messages: {
                    type: "template",
                    template: [
                        { role: "developer", content: prompt.developer },
                        { role: "user", content: prompt.user },
                    ],
                },
                source: { type: "file_id", id: "file-VCxcXGm2SKsHYgjmoWViw3" },
            },
        });
        console.log(run);
    } catch (error) {
        console.error("Error running eval:", error);
    }
}

main();
