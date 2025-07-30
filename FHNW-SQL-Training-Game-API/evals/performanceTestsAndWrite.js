require('rootpath')();
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const db = require('utils/db');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    await db.connect();

    const dataPath = path.resolve(__dirname, 'testdata/big_set.jsonl');
    const entries = fs.readFileSync(dataPath, 'utf-8')
        .trim()
        .split(/\r?\n/)
        .map(l => JSON.parse(l).item);

    function makeReq(input, answer, userId) {
        return { body: { input, answer }, user: { userId } };
    }
    function makeRes(onDone) {
        let sseBuffer = '';
        return {
            writeHead: () => { },
            flushHeaders: () => { },
            write: (chunk) => { sseBuffer += chunk; },
            end: () => onDone(sseBuffer)
        };
    }

    const TEST_USER_ID = '68249f6a571df84de698dc29';
    const outPath = path.resolve(__dirname, 'results/performance_results_gemini.csv');
    fs.writeFileSync(outPath, 'run,route,model,time_ms\n');

    const geminiOutputPath = path.resolve(__dirname, 'testdata/big_set_with_2.5gemini_run2_no_thinking_prompt2.jsonl');
    fs.writeFileSync(geminiOutputPath, '');

    let run = 1;

    const gemModels = ['gemini-2.5-flash'];
    for (const model of gemModels) {
        process.env.GEMINI_MODEL = model;

        delete require.cache[require.resolve('routes/gemini2.routes')];
        const { hintHandler: geminiHint } = require('routes/gemini2.routes');

        const writeJsonl = model === 'gemini-2.5-flash';

        for (const { input, answer } of entries) {
            await new Promise(resolve => {
                const req = makeReq(input, answer, TEST_USER_ID);
                const start = Date.now();
                const res = makeRes((sseBuffer) => {
                    const duration = Date.now() - start;
                    console.log(`#${run} gemini2@${model}: ${duration} ms`);
                    fs.appendFileSync(outPath, `${run},gemini,${model},${duration}\n`);

                    if (writeJsonl) {
                        let full = '';
                        const chunks = sseBuffer.split('\n\n').filter(Boolean);
                        for (const chunk of chunks) {
                            if (chunk.startsWith('data: ')) {
                                try {
                                    const obj = JSON.parse(chunk.slice(6));
                                    if (obj.delta) full += obj.delta;
                                } catch { }
                            }
                        }
                        const outObj = { item: { input, answer, gemini_output: full } };
                        fs.appendFileSync(geminiOutputPath, JSON.stringify(outObj) + '\n');
                    }

                    run++;
                    resolve();
                });
                geminiHint(req, res, () => { });
            });
            console.log('Warte 0s...');
            await sleep(0);
        }
    }

    console.log(`\nFertig! Ergebnisse in ${outPath}`);
    console.log(`Gemini outputs in ${geminiOutputPath}`);
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
