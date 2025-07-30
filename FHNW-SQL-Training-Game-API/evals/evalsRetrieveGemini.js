require("dotenv/config");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const RUN_ID = process.env.RUN_ID;
const EVAL_ID = process.env.EVAL_ID;

if (!RUN_ID || !EVAL_ID) {
    console.error("Please set both RUN_ID and EVAL_ID in your environment.");
    process.exit(1);
}

function sanitize(str) {
    return String(str ?? "")
        .replace(/[\r\n]+/g, " ")
        .replace(/\|/g, "\\|");
}

async function fetchAllItems(runId) {
    let all = [];
    let hasMore = true;
    let after;

    while (hasMore) {
        const resp = await openai.evals.runs.outputItems.list(
            runId,
            {
                eval_id: EVAL_ID,
                limit: 100,
                after
            }
        );
        all.push(...resp.data);
        hasMore = resp.has_more;
        after = hasMore ? resp.data.at(-1).id : undefined;
    }

    return all;
}

(async () => {
    const items = await fetchAllItems(RUN_ID);

    const rows = items.map(item => {
        const ds = item.datasource_item || {};

        return {
            Input: sanitize(ds.input),
            Answer: sanitize(ds.answer),
            Gemini_Output: sanitize(ds.gemini_output),
            UPG_Explanation: sanitize(item.results?.[0]?.sample?.output?.[0]?.content),
            UPG_Score: sanitize(item.results?.[0]?.score),
            PFG_Explanation: sanitize(item.results?.[1]?.sample?.output?.[0]?.content),
            PFG_Score: sanitize(item.results?.[1]?.score)
        };
    });

    const delim = "|";
    const header = [
        "Input",
        "Answer",
        "Gemini_Output",
        "UPG_Explanation",
        "UPG_Score",
        "PFG_Explanation",
        "PFG_Score"
    ];

    const lines = [
        header.join(delim),
        ...rows.map(r =>
            header.map(col => r[col]).join(delim)
        )
    ];

    const outPath = path.resolve(process.cwd(), "evals/results/eval_results.csv");
    fs.writeFileSync(outPath, lines.join("\n"));
    console.log(`Success: Wrote ${rows.length} rows to ${outPath}`);
})();
