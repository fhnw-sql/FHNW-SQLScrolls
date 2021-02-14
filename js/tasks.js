/* Some code originally from https://github.com/pllk/sqltrainer */

const Colors = {
  PURPLE: "col-book-purple",
  BLUE: "col-book-blue",
  GREEN: "col-book-green",
  ORANGE: "col-book-orange",
  MAGENTA: "col-book-magenta",
  LIGHT_BLUE: "col-book-light-blue",
  NONE: "col-book-white",
};

// Tasks are filled in main.js#initializeGameDictionaries
const tasks = {
  asList() {
    return Object.values(this).filter((obj) => obj instanceof Task);
  },
  getIDs() {
    return Object.keys(this).filter((key) => this[key] instanceof Task);
  },
};

/**
 * Results are used for notifying the user about their query.
 */
class Result {
  /**
   * Construct a new Result.
   *
   * table:   Table that was produced by the query.
   * error:   String, error message to show the user.
   * wanted:  Table that the Test wants.
   * correct: boolean, was the Result correct
   *
   * @param options {table, error, wanted, correct}
   */
  constructor(options) {
    this.source = options.source;
    this.table = options.table;
    this.error = options.error;
    this.wanted = options.wanted;
    this.correct = options.correct;
  }

  async render() {
    const sourceTables = await queryAllContentsOfTables(this.source.context, this.source.contextTableNames);
    if (this.error) {
      return `<div class="row justify-content-md-center">
                <div class="table-paper"><p class="col-red">${(this.error + "")
                  .split("Error")
                  .join(i18n.get("error"))}</p></div>
            </div>`;
    } else if (!this.table) {
      return `<div class="row justify-content-md-center">
                <div class="table-paper">
                    <p class="col-red">${i18n.get("i18n-write-query-first")}</p>
                </div>
            </div>`;
    } else if (this.correct) {
      return `<div class="row justify-content-md-center">
                    <div class="tables">
                        <h4 class="col-yellow">${i18n.get("tables")}</h4><hr>
                        <div class="row m-0 p-0">
                            ${sourceTables
                              .map(
                                (t) => `<div class="table-paper" aria-hidden="true">
                            ${t.renderAsTable(true)}
                        </div>`
                              )
                              .join("")}
                        </div>
                    </div>
                    <div class="tables">
                        <h4 class="col-yellow">${i18n.get("query-results")}</h4><hr>
                        <div class="table-paper">
                            ${this.table.renderAsTable(false)}
                            <p class="col-green">${i18n.get("correct")}</p>
                        </div>
                    </div>
                </div>`;
    } else {
      return `<div class="row justify-content-md-center">
                    <div class="tables">
                        <h4 class="col-yellow">${i18n.get("tables")}</h4><hr>
                        <div class="row m-0 p-0">
                            ${sourceTables
                              .map(
                                (t) => `<div class="table-paper" aria-hidden="true">
                            ${t.renderAsTable(true)}
                        </div>`
                              )
                              .join("")}
                        </div>
                    </div>
                    <div class="tables">
                        <h4 class="col-yellow">${i18n.get("query-results")}</h4><hr>
                            <div class="table-paper">
                                ${this.table.renderAsTable(false)}
                                <p class="col-red">${i18n.get("incorrect")}</p>
                            </div>
                    </div>
                    <div class="tables">
                        <h4 class="col-yellow">${i18n.get("wanted-result")}</h4><hr>
                        <div class="paper-green table-paper">${this.wanted.renderAsTable(true)}</div>
                    </div>
                </div>`;
    }
  }
}

/**
 * Represents a task a player needs to give query for.
 * @see LazyTask for a wrapper
 */
class Task extends ItemType {
  /**
   * Construct a new Task.
   *
   * parsed.metadata.id     ID of the task in tasks variable.
   * parsed.metadata.name   Name of the task that can be shown to the user.
   * parsed.metadata.color  Color of the book related to this task.
   * parsed.description     Instructions about how the task needs to be done.
   * parsed.answer          Model answer of the Task
   * parsed.parsons          parsons of the Task
   * parsed.tests           Test objects parsed by TestParser, used to test if the query for the task was correct.
   *
   * @param options {parsed: {metadata: {id, name, color}, description, tests}}
   */
  constructor(options) {
    super({
      completed: false,
      color: Colors.NONE,
      ...options,
    });
    const parsed = options.parsed;

    if (parsed) {
      this.id = parsed.metadata.id;
      this.item = new ImageItem({
        id: this.id,
        name: `${i18n.getWith("task", [Task.getNumericID(this.id)])}`,
        onclick: `Views.TASK.show('${this.id}')`,
        url: "./img/scroll.png",
      });
      this.color =
        parsed.metadata.color && parsed.metadata.color.startsWith("col-book-")
          ? parsed.metadata.color
          : `col-book-${parsed.metadata.color}`;
      this.description = parsed.description;
      this.answer = parsed.answer;
      this.parsons = parsed.parsons;
      this.tests = parsed.tests;
    }
  }

  render() {
    return `<button
                    id="${this.item.id}"
                    class="item${this.completed ? " done" : ""}"
                    onclick="${this.item.onclick}"
                    aria-label="task ${this.item.name} ${this.completed ? "(completed)" : ""}"
                >
                    ${this.item.renderShowItem()}
                    <i class="task-group-color fa fa-fw fa-2x fa-bookmark ${this.color}"></i>
                    <p>${i18n.get(this.item.name)}</p>
                </button>`;
  }

  async renderTaskTables() {
    let taskTables;
    let wantedResult;
    if (this.tests) {
      const firstTest = this.tests[0];
      wantedResult = firstTest.result;
      if (firstTest) {
        taskTables = await queryAllContentsOfTables(firstTest.context, firstTest.contextTableNames);
      }
    }
    const tables = taskTables
      ? taskTables.map((table) => `<div class="table-paper">${table.renderAsTable(true)}</div>`).join("")
      : "";
    return `<div class="tables">
                    <h4 class="col-model-blue">${i18n.get("tables")}</h4><hr>
                    <div class="row m-0 p-0">${tables}</div>
                </div>
                <div class="tables">
                    <h4 class="col-model-blue">${i18n.get("wanted-result")}</h4><hr>
                    <div class="paper-green table-paper">${wantedResult.renderAsTable()}</div>
                </div>`;
  }

  async runTests(query) {
    const results = [];
    for (let test of this.tests) {
      const wanted = test.result;
      if (query.length === 0 || query === i18n.get("i18n-query-placeholder")) {
        results.push(new Result({ source: test, correct: false, wanted }));
        continue;
      }
      if (query.split(";").length > 2) {
        results.push(
          new Result({
            source: test,
            correct: false,
            error: i18n.get("multi-query-not-allowed"),
            wanted,
          })
        );
        continue;
      }
      if (test.denySubqueries && query.toUpperCase().split("SELECT").length > 2) {
        results.push(
          new Result({
            source: test,
            correct: false,
            error: i18n.get("sub-query-not-allowed"),
            wanted,
          })
        );
        continue;
      }
      try {
        const resultSets = await runSQL(test.context, query);
        if (resultSets.length) {
          const table = Table.fromResultSet("", resultSets[0]); // i18n.get("i18n-table-result")
          const correct = table.isEqual(wanted, test.strict);
          results.push(new Result({ source: test, correct, table, wanted }));
        } else {
          results.push(
            new Result({
              source: test,
              correct: false,
              table: Table.fromPlain("", [i18n.get("query-no-rows")], []),
              wanted,
            })
          );
        }
      } catch (error) {
        results.push(new Result({ source: test, correct: false, error, wanted }));
      }
    }
    return results;
  }

  async completeTask() {
    if (this.completed) return;
    const taskGroup = taskGroups.lookupTaskGroupWithTaskId(this.id);
    this.completed = true;
    inventory.update();
    await Views.INVENTORY.updateTaskGroup();
    const from = document.getElementById("query-run-button");
    const to = StarCounter.getElement();
    const particle = flyStarFromTo("task-view", from, to);

    function frame(time) {
      particle.frame(time);
      if (particle.animated) {
        requestAnimationFrame(frame);
      } else {
        particle.element.remove();
      }
    }

    requestAnimationFrame(frame);

    await awaitUntil(() => !particle.animated);
    await Views.TASK.updateTaskCompleteMarker();
    if (DISPLAY_STATE.endgame) {
      await Views.TASK.updateFlame();
      await Views.MAP.render();
    }
    StarCounter.shake();
    showElement("task-complete-notification");
    await StarCounter.update();
    shootConfetti(200, 2);
    await taskGroup.checkGoal();
    await delay(2500);
    hideElement("task-complete-notification");
  }

  static getNumericID(from) {
    if (from.startsWith("task-")) from = from.substring(5);
    return parseInt(from);
  }

  getNumericID() {
    return Task.getNumericID(this.id);
  }
}

/**
 * Lazy-loaded version of Task that loads the task file on first call to any function.
 */
class LazyTask extends Task {
  constructor(id) {
    super({
      parsed: { metadata: { id } },
    });
    this.loaded = false;
    this.loadedTask = null;
  }

  async loadTask() {
    try {
      const loaded = new Task({ parsed: await parseTaskFrom(`tasks/${currentLang}/${this.id}.task`) });
      loaded.completed = this.completed;
      this.loadedTask = loaded;
      this.loaded = true;

      this.color = loaded.color;
      this.description = loaded.description;
      this.answer = loaded.answer;
      this.parsons = loaded.parsons;
      this.tests = loaded.tests;
    } catch (e) {
      throw e;
    }
  }

  async render() {
    if (!this.loaded) await this.loadTask();
    return await this.loadedTask.render();
  }

  async renderTaskTables() {
    if (!this.loaded) await this.loadTask();
    return await this.loadedTask.renderTaskTables();
  }

  async runTests(query) {
    if (!this.loaded) await this.loadTask();
    return await this.loadedTask.runTests(query);
  }

  async completeTask() {
    this.completed = true;
    if (!this.loaded) await this.loadTask();
    return await this.loadedTask.completeTask();
  }
}

/**
 * Represents a table from a query or a database.
 */
class Table {
  /**
   * Construct a new Table. It is recommended to use the static functions instead.
   * @param name    Name of the table
   * @param header  Column names of the table
   * @param rows    Rows in the table
   *
   * It is assumed that rows and header have same length.
   */
  constructor({ name, header, rows }) {
    this.name = name;
    this.header = header;
    this.rows = rows;
  }

  /**
   * Create a new Table from ResultSet given by sql.js
   * @param name       Name of the table
   * @param resultSet  ResultSet given by sql.js
   * @returns {Table}  a new Table
   */
  static fromResultSet(name, resultSet) {
    return new Table({
      name: name,
      header: [...resultSet.columns],
      rows: resultSet.values,
    });
  }

  /**
   * Create a new Table from markdown format for a table.
   * @param name       Name of the table
   * @param lines      Rows in the table, values separated by |, eg first|second
   * @param headers    Column names of the table, array.
   * @returns {Table}  a new Table
   *
   * It is assumed that rows and header have same length.
   */
  static fromPlain(name, lines, headers) {
    return new Table({
      name: name,
      header: headers ? headers : [],
      rows: lines.map((line) => line.split("|")),
    });
  }

  renderAsTable(showHeaders) {
    if (this.rows.length === 0) {
      let table = "";
      if (this.name) table += `<i>${this.name}</i>`;
      table += `<table><tr><td>(${i18n.get("i18n-empty-table")})</td></tr></table>`;
      return table;
    }
    let table = "";
    if (this.name) table += `<i>${this.name}</i>`;
    table += "<table>";
    if (showHeaders) {
      table += "<thead><tr>";
      for (let column of this.header) {
        table += `<th>${column}</th>`;
      }
      table += "</tr></thead>";
    }
    table += "<tbody>";
    for (let row of this.rows) {
      table += "<tr>";
      for (let value of row) {
        table += `<td>${value}</td>`;
      }
      table += "</tr>";
    }
    table += "</tbody></table>";
    return table;
  }

  renderAsPlain() {
    const lines = [];
    for (let row of this.rows) {
      lines.push(row.join("|"));
    }
    return lines;
  }

  asQueries() {
    const columnTypes = [];
    const firstRow = this.rows[0];
    for (let i = 0; i < firstRow.length; i++) {
      const value = firstRow[i];
      if (isNaN(value)) {
        columnTypes[i] = "TEXT";
      } else {
        columnTypes[i] = "NUMBER";
      }
    }

    let columns = [];
    for (let i = 0; i < this.header.length; i++) {
      columns.push(this.header[i] + " " + columnTypes[i]);
    }

    const queries = [];
    // example: CREATE TABLE Table (col1 TEXT, col2 NUMBER);
    queries.push(`CREATE TABLE ${this.name} (${columns.join(",")});`);
    for (let row of this.rows) {
      const valuesWithTypes = [];
      for (let i = 0; i < row.length; i++) {
        // Adds 'value' if TEXT and escapes ' if necessary, otherwise value (assuming number)
        valuesWithTypes.push(columnTypes[i] === "TEXT" ? `'${row[i].split("'").join("\\''")}'` : row[i]);
      }
      // example: INSERT INTO Table (col1, col2) VALUES ("value", 0);
      queries.push(`INSERT INTO ${this.name} (${this.header.join(",")}) VALUES (${valuesWithTypes.join(",")});`);
    }
    return queries;
  }

  isEqual(table, strict) {
    if (!table instanceof Table) return false;
    return isArrayEqual(this.rows, table.rows, strict);
  }
}

async function queryAllContentsOfTables(context, tableNames) {
  const queries = tableNames.map((table) => `SELECT * FROM ${table};`).join("");
  const resultSets = await runSQL(context, queries);
  const queryResults = [];
  for (let i = 0; i < resultSets.length; i++) {
    queryResults.push(Table.fromResultSet(tableNames[i], resultSets[i]));
  }
  return queryResults;
}

/**
 * Runs tests for a query, sends the answer and renders results.
 *
 * This method is called when task view is opened with a previous answer present.
 * This method is called when user selects a previous answer.
 * This method is called when user presses send answer button.
 *
 * @param allowCompletionAndStore true if sending the answer should be done
 * @return Promise that fulfills when the task is set as completed
 */
async function runQueryTests(allowCompletionAndStore) {
  function didAllError() {
    // Logic in charge of displaying no test tabs, and instead showing a single error box
    const firstError = String(results[0].error);
    const allErrorsAreSame =
      results[0].error && results.filter((result) => result.error && String(result.error) !== firstError).length === 0;
    const noTablesInResults = !results[0].table && results.filter((result) => result.table).length === 0;
    return allErrorsAreSame || noTablesInResults;
  }

  async function renderSingleError() {
    let content = "";
    content += `<div id="test-0" data-parent="#query-out-table">`;
    content += await results[0].render();
    content += `</div>`;
    return { nav: "", content };
  }

  // Side effect: allCorrect is set as false sometimes
  async function renderTestResults() {
    let content = "";
    let nav = "";
    let displayIndex = undefined;
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (!result.correct) {
        allCorrect = false;
        if (displayIndex === undefined) displayIndex = i; // Show the first failing test
      }
      const icon = result.correct
        ? `<i class="fa fa-check col-green" aria-label="${i18n.get("correct")}"></i>`
        : `<i class="fa fa-times col-light-red" aria-label="${i18n.get("incorrect")}"></i>`;

      content += `<div id="test-${i + 1}" class="collapse" aria-labelledby="test-nav-${
        i + 1
      }" data-parent="#query-out-table">`;
      content += await result.render();
      content += `</div>`;

      nav += `<li class="nav-item">
                        <button id="test-nav-${
                          i + 1
                        }" class="nav-link mr-1 collapsed" aria-expanded="false" data-toggle="collapse" data-target="#test-${
        i + 1
      }" aria-controls="test-${i + 1}" onclick="preserveTaskBoxHeight()">
                        ${icon} ${i18n.getWith("test", [i + 1])}
                        </button>
                    </li>`;
    }
    if (displayIndex === undefined) displayIndex = 0; // Make sure something is shown (first test)

    // Open the displayed test (chosen by displayIndex)
    content = content
      .split(`id="test-${displayIndex + 1}" class="collapse`, 2)
      .join(`id="test-${displayIndex + 1}" class="collapse show`);
    nav = nav
      .split(`id="test-nav-${displayIndex + 1}" class="nav-link mr-1 collapsed" aria-expanded="false"`, 2)
      .join(`id=test-nav-${displayIndex + 1}" class="nav-link mr-1" aria-expanded="true"`);
    return { nav, content };
  }

  // Side effect: allCorrect is set as false sometimes
  async function render() {
    if (allErrored) {
      allCorrect = false;
      return await renderSingleError();
    } else {
      return await renderTestResults();
    }
  }

  const query = document.getElementById("query-input").value.trim();

  animateFlame();
  animateQueryResultsClose();
  const results = await Views.TASK.currentTask.runTests(query);

  let allCorrect = true; // The results are checked during rendering
  const allErrored = didAllError();
  let rendered = await render(); // Side effect: allCorrect is set as false sometimes

  if (API.loginStatus === LoginStatus.LOGGED_IN && allowCompletionAndStore) {
    await API.quizzesSendRetryOnFail(Views.TASK.currentTask, query, allCorrect, 1);
    await Views.TASK.updatePreviousAnswers(Views.TASK.currentTask);
  }

  // Display Query Model Button
  if (API.loginStatus === LoginStatus.LOGGED_IN && Views.TASK.currentTask.answer) {
    const profile = await API.self();
    const needsHelp = profile.history[Views.TASK.currentTask.id]?.length >= 5;
    allCorrect || needsHelp
      ? await showElementImmediately("query-model-button")
      : await hideElementImmediately("query-model-button");
  }

  await animateQueryResultsOpen(rendered.nav, rendered.content);

  if (allCorrect && allowCompletionAndStore && Views.TASK.currentTask) {
    await Views.TASK.currentTask.completeTask();
  }
}
