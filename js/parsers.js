// Interface for Parsers
class Parser {
  async tryToParse(context, lines) {
    try {
      return await this.parse(context, lines);
    } catch (e) {
      console.error(
        `Malformed file, line ${
          lines[0] ? `'${lines[0]}' could not be parsed.` : "missing (Try '}' at the end of the file?)"
        }`,
        e
      );
    }
  }

  async parse(context, lines) {
    return {};
  }
}

// Parses METADATA blocks
class MetaDataParser extends Parser {
  parse(context, lines) {
    const metadata = {};
    while (true) {
      const line = lines.shift().trim();
      if (line === "}") break;
      if (line.match(/id: .*/)) metadata.id = line.substr(4);
      if (line.match(/name: .*/)) metadata.name = line.substr(6);
      if (line.match(/title: .*/)) metadata.title = line.substr(7);
      if (line.match(/author: .*/)) metadata.author = line.substr(8);
      if (line.match(/color: .*/)) metadata.color = line.substr(7);
    }
    return metadata;
  }
}

// Parses COVER blocks
class CoverParser extends Parser {
  parse(context, lines) {
    let coverText = "";
    while (true) {
      const line = lines.shift().trim();
      if (line === "}") break;
      coverText += " " + line;
    }
    // Removes preceding space
    return coverText.substr(1);
  }
}

// Parses TABLE blocks
class TableParser extends Parser {
  parse(context, lines) {
    const tableName = lines.shift().trim();
    const columnNames = lines.shift().trim();
    const rows = [];
    while (true) {
      const line = lines.shift().trim();
      if (line === "}") break;
      rows.push(line);
    }
    return Table.fromPlain(tableName, rows, columnNames.split("|"));
  }
}

// Parses SQL blocks
class StatementParser extends Parser {
  parse(context, lines) {
    let statements = "";
    while (true) {
      const line = lines.shift().trim();
      if (line === "}") break;
      statements += line;
    }
    const matches = statements.match(/CREATE TABLE .*? ?\(/g);
    return { sql: statements, tableNames: matches ? matches.map((match) => match.split(" ")[2]) : [] };
  }
}

// Parses RESULT blocks
class ResultParser extends Parser {
  parse(context, lines) {
    let plain = [];
    while (true) {
      const line = lines.shift().trim();
      if (line === "}") break;
      plain.push(line);
    }
    return Table.fromPlain("", plain); // i18n.get("i18n-wanted-result")
  }
}

// Parses LEGACY blocks
class LegacyParser extends Parser {
  parse(context, lines) {
    let legacyLines = [];
    while (true) {
      const line = lines.shift().trim();
      if (line === "}") break;
      legacyLines.push(line);
    }
    const legacyTask = this.parseTaskLegacy(legacyLines);
    const tests = [];
    for (let i = 0; i < legacyTask.tests.length; i++) {
      const test = {
        context: "",
        contextTableNames: [],
        strict: false,
        result: null,
      };
      const tables = legacyTask.tables.join(" ");
      test.context = tables + legacyTask.tests[i].join(" ");
      test.result = Table.fromPlain(i18n.get("i18n-wanted-result"), legacyTask.results[i]);
      test.strict = legacyTask.strict;
      const matches = tables.match(/CREATE TABLE .*? ?\(/g);
      if (matches) test.contextTableNames.push(...matches.map((match) => match.split(" ")[2]));
      tests.push(test);
    }
    return tests;
  }

  parseTaskLegacy(lines) {
    const Modes = {
      NOOP: 0,
      TASK: 1,
      TABLES: 2,
      TEST: 3,
      RESULT: 4,
    };
    let mode = Modes.NOOP;
    const taskLegacy = {
      tables: [],
      tableNames: [],
      testCount: 0,
      tests: [],
      results: [],
      strict: false,
    };
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === "TASK") {
        mode = Modes.NOOP;
      } else if (line === "TABLES") {
        mode = Modes.TABLES;
      } else if (line === "TEST") {
        mode = Modes.TEST;
        taskLegacy.tests.push([]);
        taskLegacy.results.push([]);
        taskLegacy.testCount++;
      } else if (line === "RESULT") {
        mode = Modes.RESULT;
      } else if (line === "STRICT") {
        taskLegacy.strict = true;
      } else if (line === "") {
        // Ignore empty lines
      } else {
        if (mode === Modes.TABLES) {
          taskLegacy.tables.push(line);
        } else if (mode === Modes.TEST) {
          taskLegacy.tests[taskLegacy.testCount - 1].push(line);
        } else if (mode === Modes.RESULT) {
          taskLegacy.results[taskLegacy.testCount - 1].push(line);
        }
      }
    }
    return taskLegacy;
  }
}

// Parses TEST blocks
class TestParser extends Parser {
  parse(context, lines) {
    const test = {
      context: "",
      contextTableNames: [],
      strict: context.strict,
      denySubqueries: context.denySubqueries,
      result: null,
    };
    while (true) {
      const line = lines.shift().trim();
      if (line === "}") break;
      if (line === "TABLE {") {
        const table = PARSERS.TABLE.parse({}, lines);
        test.contextTableNames.push(table.name);
        test.context += table.asQueries().join("");
      }
      if (line === "SQL {") {
        const parsed = PARSERS.SQL.parse({}, lines);
        test.contextTableNames.push(...parsed.tableNames);
        test.context += parsed.sql;
      }
      if (line === "STRICT") test.strict = true;
      if (line === "DENY_SUBQUERY") test.denySubqueries = true;
      if (line === "RESULT {") {
        test.result = PARSERS.RESULT.parse({}, lines);
      }
    }
    return test;
  }
}

// Parses QUERY blocks
class QueryParser extends Parser {
  async parse(context, lines) {
    const tables = context.tables;
    let queryContext = "";
    for (let table of tables) {
      for (let query of table.asQueries()) {
        queryContext += query;
      }
    }
    let query = "";
    while (true) {
      const line = lines.shift().trim();
      if (line === "}") break;
      query += line + " ";
    }

    const resultTables = [];
    try {
      const resultSets = await runSQL(queryContext, query);
      if (resultSets.length) {
        resultTables.push(Table.fromResultSet(i18n.get("i18n-table-result"), resultSets[0]));
      }
    } catch (e) {
      resultTables.push(Table.fromPlain("Virhe", ["" + e]));
    }

    return { query, resultTables };
  }
}

// Parses EXAMPLE blocks
class ExampleParser extends Parser {
  async parse(context, lines) {
    const result = {
      tables: [],
      query: "",
      resultTables: [],
    };
    while (true) {
      const line = lines.shift().trim();
      if (line === "}") break;
      if (line === "TABLE {") {
        result.tables.push(PARSERS.TABLE.parse({}, lines));
      }
      if (line === "QUERY {") {
        const parsed = await PARSERS.QUERY.parse({ tables: result.tables }, lines);
        result.query = parsed.query;
        result.resultTables.push(...parsed.resultTables);
      }
    }
    return result;
  }
}

// Parses DESCRIPTION blocks
class DescriptionParser extends Parser {
  parse(context, lines) {
    let descriptionHtml = ``;
    let paragraphs = {
      isIn: false,
      entry() {
        if (!this.isIn) {
          descriptionHtml += `<p>`;
          this.isIn = true;
        }
      },
      exit() {
        if (this.isIn) {
          descriptionHtml += `</p>`;
          this.isIn = false;
        }
      },
    };
    while (true) {
      const line = lines.shift().trim();
      if (line === "}") break;
      if (line === "") {
        // Double line-break begins a new paragraph
        paragraphs.exit();
      } else {
        paragraphs.entry();
        descriptionHtml += (line + " ").split("\\n").join("<br>");
      }
    }
    paragraphs.exit();
    return descriptionHtml;
  }
}

// Parses ANSWER blocks
class AnswerParser extends Parser {
  parse(context, lines) {
    let answerHtml = ``;
    while (true) {
      const line = lines.shift().trim();
      if (line === "}") break;
      answerHtml += (line + " ").split("\\n").join("<br>");
    }
    return answerHtml;
  }
}

// Parses PAGE blocks
class PageParser extends Parser {
  async parse(context, lines) {
    let pageHtml = ``;
    let paragraphs = {
      isIn: false,
      entry() {
        if (!this.isIn) {
          pageHtml += `<p>`;
          this.isIn = true;
        }
      },
      exit() {
        if (this.isIn) {
          pageHtml += `</p>`;
          this.isIn = false;
        }
      },
    };
    while (true) {
      const line = lines.shift().trim();
      if (line === "}") break;
      if (line === "EXAMPLE {") {
        paragraphs.exit(); // Exit paragraph if in one before table element.

        const parsed = await PARSERS.EXAMPLE.parse({}, lines);
        const tables = parsed.tables;
        const query = parsed.query;
        const resultTables = parsed.resultTables;

        const multipleTables = tables.length > 1;

        function renderTables(theTables) {
          let render = "";
          for (let table of theTables) render += `<div class="table-paper mb-3">${table.renderAsTable(true)}</div>`;
          return render;
        }

        if (multipleTables) {
          pageHtml += `<div class="multi-table">
                        <div class="row justify-content-start">
                            ${renderTables(tables)}
                        </div>
                        <p>${document.createTextNode(query).wholeText}</p>
                        <div class="row justify-content-start">
                            ${renderTables(resultTables)}
                        </div>
                    </div>`;
        } else {
          pageHtml += `${renderTables(tables)}
                        <p>${document.createTextNode(query).wholeText}</p>
                        ${renderTables(resultTables)}`;
        }
      } else if (line === "") {
        // Double line-break begins a new paragraph
        paragraphs.exit();
      } else {
        paragraphs.entry();
        pageHtml += (line + " ").split("\\n").join("<br>");
      }
    }
    paragraphs.exit();
    return pageHtml;
  }
}

// Parses .task files. See Example.task for format.
class TaskParser extends Parser {
  parse(context, lines) {
    const task = {
      metadata: {},
      description: "",
      answer: "",
      tests: [],
    };
    context.strict = false;
    context.denySubqueries = false;
    while (true) {
      let line = lines.shift();
      if (line === undefined) break;

      line = line.trim();
      if (line === "STRICT") context.strict = true;
      if (line === "DENY_SUBQUERY") context.denySubqueries = true;
      if (line === "METADATA {") {
        task.metadata = PARSERS.METADATA.parse({}, lines);
      }
      if (line === "DESCRIPTION {") {
        task.description = PARSERS.DESCRIPTION.parse({}, lines);
      }
      if (line === "ANSWER {") {
        task.answer = PARSERS.ANSWER.parse({}, lines);
      }
      if (line === "TEST {") {
        task.tests.push(PARSERS.TEST.parse(context, lines));
      }
      if (line === "LEGACY {") {
        task.tests.push(...PARSERS.LEGACY.parse({}, lines));
      }
    }
    return task;
  }
}

// Parses .book files. See Example.book for format.
class BookParser extends Parser {
  async parse(context, lines) {
    const book = {
      metadata: {},
      cover: "",
      pages: [],
    };
    while (true) {
      let line = lines.shift();
      if (line === undefined) break;

      line = line.trim();
      if (line === "METADATA {") {
        book.metadata = await PARSERS.METADATA.parse({}, lines);
      }
      if (line === "COVER {") {
        book.cover = await PARSERS.COVER.parse({}, lines);
      }
      if (line === "PAGE {") {
        book.pages.push(await PARSERS.PAGE.parse({}, lines));
      }
    }
    return book;
  }
}

const PARSERS = {
  BOOK: new BookParser(),
  METADATA: new MetaDataParser(),
  COVER: new CoverParser(),
  PAGE: new PageParser(),
  EXAMPLE: new ExampleParser(),
  TABLE: new TableParser(),
  QUERY: new QueryParser(),
  RESULT: new ResultParser(),
  SQL: new StatementParser(),
  LEGACY: new LegacyParser(),
  TEST: new TestParser(),
  ANSWER: new AnswerParser(),
  DESCRIPTION: new DescriptionParser(),
  TASK: new TaskParser(),
};

async function parseBook(lines) {
  return PARSERS.BOOK.tryToParse({}, lines);
}

async function parseBookFrom(address) {
  return await parseBook(await readLines(address));
}

async function parseTask(lines) {
  return PARSERS.TASK.tryToParse({}, lines);
}

async function parseTaskFrom(address) {
  return await parseTask(await readLines(address));
}
