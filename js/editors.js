EDITOR_STATE = {
  parsedBook: null,
  parsedTask: null,
  dirty: false,
  confirmOnUnsaved: true,
};

const bookEditorField = document.getElementById("book-editor-textfield");
const taskEditorField = document.getElementById("task-editor-textfield");
const progressionEditorField = document.getElementById("progression-editor-textfield");
bookEditorField.onkeydown = (event) => {
  onEditorKeydown(event);
  onBookEditorPageSwap(event);
};
bookEditorField.onclick = onBookEditorPageSwap;
bookEditorField.onfocus = onBookEditorPageSwap;
taskEditorField.onkeydown = onEditorKeydown;
document.getElementById("query-input").oninput = runQueryTests;
document.getElementById("save-warning-check").oninput = (event) => {
  EDITOR_STATE.confirmOnUnsaved = event.target.checked;
};

window.onbeforeunload = () => {
  if (EDITOR_STATE.dirty && EDITOR_STATE.confirmOnUnsaved)
    return "Some changes have not been saved, do you still want to exit?";
};

/**
 * Handles some indentation related key events:
 *
 * - Tab, indents by 4 spaces
 * - Shift+Tab, reduces indent by 4 spaces
 * - Enter, keeps same indent as previous line
 * - Backspace, removes indent of empty line
 *
 * @param event
 * @returns {boolean}
 */
function onEditorKeydown(event) {
  const value = event.target.value;
  const selectStart = event.target.selectionStart;
  const selectEnd = event.target.selectionEnd;
  const lineStart = value.substr(0, selectStart).lastIndexOf("\n") + 1;
  const lineEnd = lineStart + value.substring(lineStart).indexOf("\n");

  const startOfLine = value.substr(lineStart, 4);

  EDITOR_STATE.dirty = true;

  if (event.key === "Tab") {
    event.preventDefault();
    if (event.shiftKey) {
      if (startOfLine === "    ") {
        const beforeLine = value.substr(0, lineStart);
        const newLines = value.substring(lineStart + 4, selectEnd).split("\n    ");
        const lineWithSpaceRemoved = newLines.join("\n");
        const afterSelection = value.substring(selectEnd);
        event.target.value = beforeLine + lineWithSpaceRemoved + afterSelection;
        event.target.selectionStart = selectStart - 4;
        event.target.selectionEnd = selectEnd - 4 * newLines.length;
      }
    } else {
      const beforeLine = value.substr(0, lineStart);
      const newLines = value.substring(lineStart, selectEnd).split("\n");
      const line = newLines.join("\n    ");
      const afterSelection = value.substring(selectEnd);
      event.target.value = beforeLine + "    " + line + afterSelection;
      event.target.selectionStart = selectStart + 4;
      event.target.selectionEnd = selectEnd + 4 * newLines.length;
      return false;
    }
    event.target.oninput();
  }

  const line = value.substring(lineStart, lineEnd);
  let indent = 0;
  while (value.substring(lineStart + indent, lineEnd).startsWith(" ")) indent++;
  if (event.key === "Enter") {
    event.preventDefault();

    if (line.endsWith("{")) indent += 4;
    const beforeSelection = value.substr(0, selectStart);
    const afterSelection = value.substring(selectEnd);
    event.target.value = beforeSelection + "\n" + " ".repeat(indent) + afterSelection;
    event.target.selectionStart = event.target.selectionEnd = selectStart + indent + 1;
    event.target.oninput();
  }
  if (event.key === "Backspace") {
    if (line.trim() === "") {
      const beforeLine = value.substr(0, lineStart);
      const newLines = value.substring(lineStart + indent, selectEnd).split("\n    ");
      const lineWithSpaceRemoved = newLines.join("\n");
      const afterSelection = value.substring(selectEnd);
      event.target.value = beforeLine + lineWithSpaceRemoved + afterSelection;
      event.target.selectionStart = selectStart - indent;
      event.target.selectionEnd = selectEnd - indent * newLines.length;
    }
  }
}

function onBookEditorPageSwap(event) {
  const selectStart = event.target.selectionStart;
  let pageCount = event.target.value.substring(0, selectStart).split("PAGE {").length - 1;
  Views.READ_BOOK.shownBookPage = pageCount <= 1 ? 0 : pageCount - 1 - (pageCount % 2);
  updateEditedBook();
}

/* Book editor ------------------------------------ */

async function showBookEditor() {
  await hideElement("inventory-view");
  const lines = await readLines("./Example.book");

  bookEditorField.value = lines.join("\n");
  bookEditorField.setAttribute("rows", `${Math.min(lines.length, 30)}`);

  EDITOR_STATE.parsedBook = await parseBook(lines);

  Views.READ_BOOK.shownBookPage = 0;
  updateEditedBook();

  await showElement("book-editor-view");
}

async function updateBasedOnBookEditor() {
  EDITOR_STATE.parsedBook = await parseBook(bookEditorField.value.split("\n"));
  updateEditedBook();
  document.getElementById("book-editor-error").innerText = "";
}

function updateEditedBook() {
  const bookItem = new BookItem({
    id: EDITOR_STATE.parsedBook.metadata.id,
    parsed: EDITOR_STATE.parsedBook,
  });
  bookItem.newItem = false;
  bookItem.onclick = "";
  Views.READ_BOOK.currentBook = bookItem;
  Views.READ_BOOK.showTheBook();

  const bookID = bookItem.id;
  document.getElementById("book-ids").innerHTML = bookID.startsWith("Book-")
    ? `Book id: ${bookID}`
    : "<span style='color: lightcoral;'>id should be of format 'Book-{letter}'!</span>";
  document.getElementById("book-small-preview").innerHTML = bookItem.render();
}

function saveBook() {
  const id = EDITOR_STATE.parsedBook.metadata.id;
  saveFile(`${id}.book`, bookEditorField.value);
  EDITOR_STATE.dirty = false;
}

async function loadSelectedBook() {
  if (
    EDITOR_STATE.dirty &&
    EDITOR_STATE.confirmOnUnsaved &&
    !confirm("Some changes have not been saved, do you still want to continue?")
  ) {
    return;
  }
  const selected = document.getElementById("book-editor-existing").value;
  const lines = await readLines(selected);
  bookEditorField.value = lines.join("\n");
  Views.READ_BOOK.shownBookPage = 0;
  await updateBasedOnBookEditor();
  EDITOR_STATE.dirty = false;
}

async function uploadBook() {
  if (
    EDITOR_STATE.dirty &&
    EDITOR_STATE.confirmOnUnsaved &&
    !confirm("Some changes have not been saved, do you still want to continue?")
  ) {
    return;
  }
  bookEditorField.value = await uploadFile(".book,.txt");
  Views.READ_BOOK.shownBookPage = 0;
  await updateBasedOnBookEditor();
  EDITOR_STATE.dirty = false;
}

/* Task editor ------------------------------------ */

async function showTaskEditor() {
  await hideElement("inventory-view");
  const lines = await readLines("./Example.task");

  taskEditorField.value = lines.join("\n");
  taskEditorField.setAttribute("rows", `${Math.min(lines.length, 30)}`);

  EDITOR_STATE.parsedTask = await parseTask(lines);

  await updateEditedTask();

  await showElement("task-editor-view");
}

async function updateBasedOnTaskEditor() {
  EDITOR_STATE.parsedTask = await parseTask(taskEditorField.value.split("\n"));
  document.getElementById("task-editor-error").innerText = "";
  await updateEditedTask();
}

async function updateEditedTask() {
  Views.TASK.currentTask = new Task({
    id: EDITOR_STATE.parsedTask.metadata.id,
    parsed: EDITOR_STATE.parsedTask,
  });
  Views.TASK.currentTask.completed = false;
  Views.TASK.currentTask.newItem = false;
  Views.TASK.currentTask.item.onclick = "";
  try {
    const taskID = Views.TASK.currentTask.id;
    document.getElementById("task-ids").innerHTML = taskID.startsWith("task-")
      ? `Task id: ${taskID}, Quizzes id: ${Views.TASK.currentTask.getNumericID()}`
      : "<span style='color: lightcoral;'>id should be of format 'task-{number}'!</span>";
    await Views.TASK.showWithQuery(document.getElementById("query-input").value);
    await runQueryTests();
  } catch (e) {
    console.error(e);
    document.getElementById("task-editor-error").innerText = `${e}`;
  }
}

function saveTask() {
  const id = EDITOR_STATE.parsedTask.metadata.id;
  saveFile(`${id}.task`, taskEditorField.value);
  EDITOR_STATE.dirty = false;
}

async function loadSelectedTask() {
  if (
    EDITOR_STATE.dirty &&
    EDITOR_STATE.confirmOnUnsaved &&
    !confirm("Some changes have not been saved, do you still want to continue?")
  ) {
    return;
  }
  const selected = document.getElementById("task-editor-existing").value;
  const lines = await readLines(selected);
  taskEditorField.value = lines.join("\n");
  await updateBasedOnTaskEditor();
  EDITOR_STATE.dirty = false;
}

async function uploadTask() {
  if (
    EDITOR_STATE.dirty &&
    EDITOR_STATE.confirmOnUnsaved &&
    !confirm("Some changes have not been saved, do you still want to continue?")
  ) {
    return;
  }
  taskEditorField.value = await uploadFile(".task,.txt");
  await updateBasedOnTaskEditor();
  EDITOR_STATE.dirty = false;
}

/* Start ---------------- */

async function beginEditor() {
  // Overwrite changeView function to avoid bugs.
  changeView = function () {};

  await loadGameElements(await readLines("./tasks/progression.js"));
  // Load the book items from files and add as options.
  await loadItems();
  let bookOptions = `<option>Example.book</option>`;
  for (let item of items.asList()) {
    if (item instanceof BookItem) {
      bookOptions += `<option>./books/en/${item.id}.book</option>`;
    }
  }
  document.getElementById("book-editor-existing").innerHTML = bookOptions;

  let taskOptions = `<option>Example.task</option>`;
  for (let taskID of tasks.getIDs()) {
    taskOptions += `<option>./tasks/en/${taskID}.task</option>`;
  }
  document.getElementById("task-editor-existing").innerHTML = taskOptions;

  // Force logout state
  if (API.loginStatus === LoginStatus.LOGGED_IN) {
    await API.logout();
    location.reload();
  }
}

beginEditor();
