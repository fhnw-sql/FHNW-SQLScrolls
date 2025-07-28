const fg = require('fast-glob');
const fs = require('fs').promises;

const TASK_GLOB = 'tasks/en/*.task';

const KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'GROUP', 'BY', 'ORDER', 'INSERT', 'UPDATE', 'DELETE',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'ON', 'HAVING', 'LIMIT', 'DISTINCT',
  'AND', 'OR', 'NOT', 'AS', 'TOP', 'IN', 'IS', 'NULL', 'BETWEEN', 'LIKE', 'EXISTS',
  'UNION', 'ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ADD', 'ALTER', 'CREATE',
  'DROP', 'TABLE', 'VIEW', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
  'INTEGER', 'VARCHAR', 'TEXT', 'DATE', 'TIMESTAMP', 'BOOLEAN',
  'ARRAY', 'CAST', 'COALESCE', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'EXTRACT',
  'REAL', 'FLOAT', 'DECIMAL', 'ROUND', 'TRIM', 'SUBSTRING', 'CONCAT',
  'LENGTH', 'POSITION', 'UPPER', 'LOWER'
]);

function tokenize(sql) {
  return sql.match(
    /'[^']*'|`[^`]*`|"[^"]*"|>=|<=|<>|!=|[*(),.;=<>+\-/%]|[A-Za-z_][A-Za-z0-9_]*|\d+\.\d+|\d+/g
  ) || [];
}

function toSkeleton(sql) {
  return tokenize(sql).map(tok => {
    const upper = tok.toUpperCase();

    // 1) Keywords -> keep uppercase
    if (KEYWORDS.has(upper)) return upper;

    // 2) JSON-* identifiers -> keep as-is
    if (/^JSON/i.test(tok)) return tok;

    // 3) JSON-path literal -> '$.__'
    if (/^'\$\.[^']*'$/.test(tok)) return "'$.__'";

    // 4) All other single-quoted literals -> blank
    if (/^'[^']*'$/.test(tok)) return "'__'";

    // 5) Operators & punctuation (includes . and $) -> keep
    if (/^(>=|<=|<>|!=|[\$\*\(\),\.;=<>+\-\/%])$/.test(tok)) return tok;

    // 6) Everything else (identifiers, numbers, etc.) -> blank
    return '__';
  }).join(' ')
    .replace(/__ \. __/g, '_.__')
    .replace(/- >/, '->');
}

/**
 * Reads one task file, builds & appends the SKELETON section.
 * @param {string} file The path to the task file.
 */
async function processFile(file) {
  let text = await fs.readFile(file, 'utf8');

  // strip out any existing SKELETON { … } block
  text = text.replace(
    //   match "SKELETON {", then anything (including newlines), then the closing "}"
    /^\s*SKELETON\s*{[\s\S]*?}\s*/m,
    ''
  );

  // extract the ANSWER SQL
  const answerMatch = text.match(/ANSWER\s*{([\s\S]*?)}/m);
  if (!answerMatch) {
    console.warn('⚠ no ANSWER block found in', file);
    return;
  }
  const sql = answerMatch[1].trim().replace(/\s+/g, ' ');

  const skeleton = toSkeleton(sql);

  // build the block (pretty-print with same indentation depth as ANSWER)
  const indent = (answerMatch[0].match(/^\s*/) ?? [''])[0];
  const skeletonBlock =
    `\n\n${indent}SKELETON {\n` +
    `${indent}    ${skeleton}\n` +
    `${indent}}\n`;

  // append and save
  await fs.writeFile(file, text + skeletonBlock, 'utf8');
  console.log('✚ added skeleton:', file);
}

async function main() {
  const files = await fg(TASK_GLOB, { absolute: true });
  console.log('[debug] matched', files.length, 'file(s)');
  await Promise.all(files.map(processFile));
  console.log(`\nDone. Processed ${files.length} file(s).`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});