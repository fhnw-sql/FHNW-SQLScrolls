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
  editMode: false,

  currentView: Views.LOGIN,
  secondaryView: Views.NONE,
  previousView: Views.NONE,
  previousSecondaryView: Views.NONE,
};

const inStoreMode = sessionStorage.getItem("mode");
DISPLAY_STATE.editMode = inStoreMode ? (inStoreMode == "edit"): false;
console.log("DISPLAY_STATE.editMode", DISPLAY_STATE.editMode)

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

async function showInventory() {
  await hideElementImmediately("inventory-show-button");
  await showElement("inventory");
}

async function hideInventory() {
  await hideElement("inventory");
  await showElement("inventory-show-button");
}

// default the inventroy is hidden
if (!DISPLAY_STATE.editMode) hideInventory();

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
    // inventory.addItem("item-999");
  }

  preventLevelIdDuplicates();
  const requiredByMatrix = calculateRequiredByMatrix();
  preventCyclesAndTaskDuplicates(requiredByMatrix);
  initializeGameDictionaries(requiredByMatrix);
}

async function logout() {
  if (API.isSWITCHaaiLogin()) {
    API.logoutSWITCHaai();
    window.location.href = Config.SWITCHAAI_LOGOUT_URL; // SWITCH logout page
  } else {
    API.logout();
    await changeView(Views.LOGIN);
    window.location.href = "./"; // Reloads the page
  }
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
    // Notification if user tries to leave the page, as it is a vanilla js app without a SPA router like in react
    // we need to notify the user as the back button would result leaving the page
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = i18n.get("leave-page-alert");
      (e || window.event).returnValue = confirmationMessage; //Gecko + IE
      return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });

    await loadLanguage(currentLang);

    try {
      await loadGameElements(await readLines("tasks/progression.js"));
    } catch (e) {
      return showError(`Could not load tasks/progression.js: ${e}`);
    }
    await loadItems();
    await awaitUntil(() => items.loaded);
    await inventory.update();
    if ($("#star-counter").length) await StarCounter.update();

    // Default game is not muted
    sessionStorage.setItem("mute", false);

    // Custom router if we ask to reset password
    await routeActionMiddleware("resetPassword", async (urlParams) => {
      const token = urlParams.get("token");
      document.getElementById("inputResetPasswordToken").value = token;
      API.logout();
      await changeView(Views.RESET_PASSWORD);
    });

    // Default Middleware routing
    await routeActionMiddleware("", async (urlParams) => {
      API.loginExisting();
      if (API.loginStatus === LoginStatus.LOGGED_IN && (!DISPLAY_STATE.editMode) ) {
        loadCompletionFromQuizzes(); // async load of task completion, see DISPLAY_STATE.saveLoaded
        changeView(Views.LOADING); // LOADING view awaits DISPLAY_STATE.saveLoaded and DISPLAY_STATE.loaded are true.
        await showElementImmediately("counter-container");
        await showElementImmediately("right-sidebar");
      } else {
        if (location.pathname !== "/editors.html") {
          // TODO: check that it is not empty
          if (getAuthCookie()) {
            await Views.LOGIN.loginSWITCHaai(getAuthCookie());
          } else {
            await showElementImmediately("login-view")
          }
      };
      }
    });

    await fadeFromBlack();

    DISPLAY_STATE.loaded = true;
  } catch (error) {
    console.error(error);
    showError(`Could not load game: ${error.message}`);
  }
}

async function restartUser() {
  let res = API.restartUser();
  console.log("restartUser", res)
  window.location.href = "./"; // Reloads the page
}

beginGame().catch(showError);
