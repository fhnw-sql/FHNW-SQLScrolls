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
    return {
      writeHead: () => { },
      flushHeaders: () => { },
      write: () => { },
      end: () => onDone()
    };
  }

  const TEST_USER_ID = '68249f6a571df84de698dc29';
  const outPath = path.resolve(__dirname, 'performance_results.csv');
  fs.writeFileSync(outPath, 'run,route,model,time_ms');

  let run = 1;

  const aiModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gpt-4.1', 'gpt-3.5-turbo'];
  for (const model of aiModels) {
    const isOpenAI = model.startsWith('gpt');

    process.env.LLM = isOpenAI ? 'openai' : 'gemini';
    if (isOpenAI) {
      process.env.OPENAI_MODEL = model;
    } else {
      process.env.GEMINI_MODEL = model;
    }

    delete require.cache[require.resolve('routes/ai.routes')];
    const { hintHandler: aiHint } = require('routes/ai.routes');

    for (const { input, answer } of entries) {
      await new Promise(resolve => {
        const req = makeReq(input, answer, TEST_USER_ID);
        const start = Date.now();
        const res = makeRes(() => {
          const duration = Date.now() - start;
          console.log(`#${run} ai@${model}: ${duration} ms`);
          fs.appendFileSync(outPath, `${run},ai,${model},${duration}
`);
          run++;
          resolve();
        });
        aiHint(req, res, () => { });
      });
      console.log('Warte 5s...');
      await sleep(5000);
    }
  }

  const gemModels = ['gemini-2.5-flash', 'gemini-1.5-flash'];
  for (const model of gemModels) {
    process.env.GEMINI_MODEL = model;

    delete require.cache[require.resolve('routes/gemini.routes')];
    const { hintHandler: geminiHint } = require('routes/gemini.routes');

    for (const { input, answer } of entries) {
      await new Promise(resolve => {
        const req = makeReq(input, answer, TEST_USER_ID);
        const start = Date.now();
        const res = makeRes(() => {
          const duration = Date.now() - start;
          console.log(`#${run} gemini@${model}: ${duration} ms`);
          fs.appendFileSync(outPath, `${run},gemini,${model},${duration}
`);
          run++;
          resolve();
        });
        geminiHint(req, res, () => { });
      });
      console.log('Warte 5s...');
      await sleep(5000);
    }
  }

  console.log(`
Fertig! Ergebnisse in ${outPath}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
