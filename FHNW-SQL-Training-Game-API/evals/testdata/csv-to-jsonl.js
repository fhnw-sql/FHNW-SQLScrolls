const fs = require("fs");
const { parse } = require("csv-parse");

const inPath = "evals/testdata/testdata-master_small.csv";          
const outPath = "evals/testdata/out.jsonl";           

if (!fs.existsSync(inPath)) {
  console.error(`Error: Input file "${inPath}" does not exist.`);
  process.exit(1);
}

const csvStream = fs.createReadStream(inPath);
const jsonlStream = fs.createWriteStream(outPath, { flags: "w" });

const parser = parse({
  columns: true,
  trim: true,
  skip_empty_lines: true
});

parser.on("readable", () => {
  for (let record; (record = parser.read()) !== null; ) {
    const { input, answer } = record;

    if (input && answer) {
      const line = JSON.stringify({ item: { input, answer } }) + "\n";
      jsonlStream.write(line);
    } else {
      console.warn("Skipping row missing input/answer:", record);
    }
  }
});

parser.on("end", () => {
  jsonlStream.end(() => console.log(`Success: Finished → ${outPath}`));
});

parser.on("error", err => {
  console.error("CSV parse error:", err.message);
  process.exit(1);
});

csvStream.pipe(parser);
