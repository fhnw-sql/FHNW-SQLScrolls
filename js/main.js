const eventQueue = {
  push(view, event) {
    if (!this[view.id]) this[view.id] = [];
    this[view.id].push(event);
  },
  clear() {
    for (const view of Object.values(Views)) {
      delete this[view.id];
    }
  },
};

DISPLAY_STATE = {
  loaded: false,
  saveLoaded: false,
  bookMenuUnlocked: false,
  endgame: false,
  gameCompleted: false,

  currentView: Views.LOGIN,
  secondaryView: Views.NONE,
  previousView: Views.NONE,
  previousSecondaryView: Views.NONE,
};

function registerListeners() {
  window.addEventListener("error", (event) => console.error(event.error));

  const queryInputField = Views.TASK.queryInputField;
  queryInputField.onfocus = () => {
    if (queryInputField.value.includes(i18n.get("query-placeholder"))) {
      queryInputField.value = "";
    }
  };
  queryInputField.onblur = () => {
    if (queryInputField.value.length === 0) {
      queryInputField.value = i18n.get("query-placeholder");
    }
  };
  queryInputField.addEventListener("keyup", () => {
    if (Views.TASK.selectedPreviousAnswer) {
      Views.TASK.unsetPreviousAnswerSelection();
    }
  });

  document.body.addEventListener("keyup", async function (e) {
    if (e.key === "Tab") {
      // Start showing focus outlines when tab is pressed
      document.getElementById("body").classList.remove("no-focus-outline");
    }
    // Escape moves out of TASK view
    if (DISPLAY_STATE.currentView === Views.TASK && e.key === "Escape") {
      await changeView(DISPLAY_STATE.previousView);
    }
  });
}

registerListeners();

function showError(error) {
  console.error(error);
  document.getElementById(
    `alerts`
  ).innerHTML = `<div class="alert alert-danger alert-dismissible" role="alert">Error: ${error}
        <button type="button" class="close" data-dismiss="alert" aria-label="${i18n.get("close")}">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`;
}

async function changeView(toView) {
  if (DISPLAY_STATE.currentView === toView) return;
  DISPLAY_STATE.previousView = DISPLAY_STATE.currentView;
  await DISPLAY_STATE.currentView.close();
  DISPLAY_STATE.currentView = toView;
  const eventsToFire = eventQueue[toView.id];
  if (eventsToFire && eventsToFire.length) {
    for (let event of eventsToFire) {
      await event();
    }
    eventQueue[toView.id] = [];
  }
  await DISPLAY_STATE.currentView.open();
}

async function changeSecondaryView(toView) {
  if (DISPLAY_STATE.secondaryView === toView) return;
  DISPLAY_STATE.previousSecondaryView = DISPLAY_STATE.secondaryView;
  await DISPLAY_STATE.secondaryView.close();
  DISPLAY_STATE.secondaryView = toView;
  const eventsToFire = eventQueue[toView.id];
  if (eventsToFire && eventsToFire.length) {
    for (let event of eventsToFire) {
      await event();
    }
    eventQueue[toView.id] = [];
  }
  await DISPLAY_STATE.secondaryView.open();
}

let progression;

async function loadGameElements(linesOfProgressionJs) {
  eval(linesOfProgressionJs.join(""));
  if (!progression) {
    throw new Error("'progression' is undefined after eval.");
  }

  function lookup(id) {
    for (let level of progression) {
      if (level.id === id) return level;
    }
    return undefined;
  }

  function preventLevelIdDuplicates() {
    for (let level of progression) {
      if (level !== lookup(level.id))
        throw new Error(`Duplicate ID '${level.id}', Same thing can not be in the graph twice.`);
    }
  }

  function calculateRequiredByMatrix() {
    const requiredByMatrix = {};
    for (let level of Object.values(progression)) {
      for (let req of level.requires) {
        if (!requiredByMatrix[level.id]) requiredByMatrix[level.id] = [];
        if (!requiredByMatrix[req]) requiredByMatrix[req] = [];
        if (req) requiredByMatrix[req].push(level);
      }
    }
    return requiredByMatrix;
  }

  // Find cycles and layer numbers with BFS
  function preventCyclesAndTaskDuplicates(requiredByMatrix) {
    const root = "A";
    lookup(root).layer = 0;
    const que = [root];
    let covered = 0;
    let previousLayer = 0;
    const visitedTaskIDs = {};
    while (que.length > 0) {
      const id = que.shift();
      const currentLevel = lookup(id);

      if (covered > 100) {
        throw new Error(`Cycle detected in the progression graph, triggered BFS step limit threshold (${100})`);
      }
      covered++;

      const requiredLevels = requiredByMatrix[id];
      previousLayer = currentLevel.layer + 1;
      requiredLevels.forEach((level) => (level.layer = currentLevel.layer + 1));

      for (let taskID of currentLevel.tasks) {
        if (visitedTaskIDs[taskID] && visitedTaskIDs[taskID] !== id)
          throw new Error(
            `Duplicate task id '${taskID}' on level ${id} (was already defined for level ${visitedTaskIDs[taskID]})`
          );
        visitedTaskIDs[taskID] = id;
      }

      que.push(...requiredLevels.map((level) => level.id));
    }
  }

  function initializeGameDictionaries(requiredByMatrix) {
    for (let level of Object.values(progression)) {
      const layer = level.layer;
      if (layer === undefined) continue;

      taskGroups[level.id] = new TaskGroup({
        id: level.id,
        unlocked: level.layer === 0,
        newItem: level.layer === 0,
        tasks: level.tasks,
        requires: level.requires,
        requiredBy: requiredByMatrix[level.id].map((level) => level.id),
      });

      for (let taskID of level.tasks) {
        tasks["task-" + taskID] = new LazyTask("task-" + taskID);
      }
    }
    inventory.addItems(taskGroups.asList().map((taskGroup) => taskGroup.item.id));
    inventory.removeItem("task-group-X");
    inventory.addItem("item-999");
  }

  preventLevelIdDuplicates();
  const requiredByMatrix = calculateRequiredByMatrix();
  preventCyclesAndTaskDuplicates(requiredByMatrix);
  initializeGameDictionaries(requiredByMatrix);
}

async function register() {
  const username = document.getElementById("inputUserLogin").value;
  if (!username) return await Views.LOGIN.showLoginError(i18n.get("login-error-no-user"));
  const password = document.getElementById("inputPasswordLogin").value;
  if (!password) return await Views.LOGIN.showLoginError(i18n.get("login-error-no-password"));
}

async function login() {
  await Views.LOGIN.clearLoginError();
  const username = document.getElementById("inputUserLogin").value;
  if (!username) return await Views.LOGIN.showLoginError(i18n.get("login-error-no-user"));
  const password = document.getElementById("inputPasswordLogin").value;
  if (!password) return await Views.LOGIN.showLoginError(i18n.get("login-error-no-password"));

  Views.LOGIN.startLogin();
  try {
    await API.login(username, password);
    if (API.loginStatus === LoginStatus.ERRORED) {
      await Views.LOGIN.showLoginError(i18n.get("login-error-failed-unknown"));
    } else if (API.loginStatus === LoginStatus.LOGGED_IN) {
      changeView(Views.LOADING);
      await showElementImmediately("loading-view");
      await showElementImmediately("counter-container");
      await showElementImmediately("right-sidebar");
      loadCompletionFromQuizzes();
    }
  } catch (e) {
    await Views.LOGIN.showLoginError(e);
  }
  Views.LOGIN.endLogin();
}

async function logout() {
  API.logout();
  await changeView(Views.LOGIN);
  window.location.href = "./"; // Reloads the page
}

// This is a separate function in order to allow side-loading the task completion.
async function loadCompletionFromQuizzes() {
  // DO NOT INLINE: The promise chain will cause the game to not load.
  // Note: you can give integer param to this function to override task completion
  const completedTaskIDs = await API.fetchCompletedTaskIDs(/*100*/);
  await load(completedTaskIDs);
}

async function beginGame() {
  try {
    await loadLanguage(currentLang);
    API.loginExisting();
    if (API.loginStatus === LoginStatus.LOGGED_IN) {
      loadCompletionFromQuizzes(); // async load of task completion, see DISPLAY_STATE.saveLoaded
      changeView(Views.LOADING); // LOADING view awaits DISPLAY_STATE.saveLoaded and DISPLAY_STATE.loaded are true.
      await showElementImmediately("counter-container");
      await showElementImmediately("right-sidebar");
    } else {
      await showElementImmediately("login-view");
      await fadeFromBlack();
    }
    try {
      await loadGameElements(await readLines("tasks/progression.js"));
    } catch (e) {
      return showError(`Could not load tasks/progression.js: ${e}`);
    }
    await loadItems();
    await awaitUntil(() => items.loaded);
    await inventory.update();
    await StarCounter.update();
    DISPLAY_STATE.loaded = true;
  } catch (error) {
    console.error(error);
    showError(`Could not load game: ${error.message}`);
  }
}

beginGame().catch(showError);
