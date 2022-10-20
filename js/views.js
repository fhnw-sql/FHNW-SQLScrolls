/**
 * Represents a view with nothing in it.
 *
 * a Main view, use changeView-function with this view.
 * a Secondary view, use changeSecondaryView-function with this view.
 */
class View {
  constructor(id) {
    this.id = id;
  }

  async open() {}

  async close() {}
}

// Functionality related to Scrolls - Map switch button in the endgame.
const TaskViewSwap = {
  async toInventoryView() {
    document.getElementById("task-view-swap").setAttribute("onclick", "TaskViewSwap.toMapView()");
    document.getElementById("task-view-swap-icon").classList.replace("fa-scroll", "fa-map");
    document.getElementById("task-view-swap-text").innerHTML = i18n.get("map-text");
    await changeView(Views.INVENTORY);
  },
  async toMapView() {
    document.getElementById("task-view-swap").setAttribute("onclick", "TaskViewSwap.toInventoryView()");
    document.getElementById("task-view-swap-icon").classList.replace("fa-map", "fa-scroll");
    document.getElementById("task-view-swap-text").innerHTML = i18n.get("tasks-text");
    await changeView(Views.MAP);
  },
  async show() {
    await showElementImmediately("task-view-swap");
  },
  async hide() {
    await hideElementImmediately("task-view-swap");
  },
};

// Functionality related to Books button
const BookMenuButton = {
  async open(event) {
    await Views.READ_BOOK.show(event);
  },
  async show() {
    await showElementImmediately("book-menu");
  },
  async hide() {
    await hideElementImmediately("book-menu");
  },
  async shake() {
    await shakeElement("book-menu");
  },
  async unlock() {
    if (DISPLAY_STATE.bookMenuUnlocked) return;
    DISPLAY_STATE.bookMenuUnlocked = true;
    const icon = document.getElementById("book-menu-icon");
    const text = document.getElementById("book-menu-text");
    await this.show();
    await delay(500);
    icon.style.fontSize = "5rem";
    text.style.fontSize = "2rem";
    await delay(1000);
    await this.shake();
    icon.style.fontSize = "";
    text.style.fontSize = "";
  },
};

// Functionality related to Profile button
const ProfileButton = {
  async show() {
    await showElementImmediately("profile-menu");
  },
  async hide() {
    await hideElementImmediately("profile-menu");
  },
};

// Functionality related to the star counter
const StarCounter = {
  async update() {
    await this.show();
    const indicator = this.getElement();
    if (indicator) {
      const stars = taskGroups.getCompletedTaskCount();
      const outOf = taskGroups.getTaskCount();
      indicator.innerHTML = `<i class="fa fa-star col-yellow" aria-label="${i18n.get(
        "star-count"
      )}"></i> ${stars} / ${outOf}`;
    }
  },
  async shake() {
    await shakeElement("star-counter");
  },
  async show() {
    await showElementImmediately("star-counter");
  },
  async hide() {
    await hideElementImmediately("star-counter");
  },
  getElement() {
    return document.getElementById("star-counter");
  },
};

/**
 * Represents the view with items.
 *
 * a Main view, use changeView-function with this view.
 */
class InventoryView extends View {
  constructor() {
    super("inventory-view");
    this.currentTaskGroup = null;
  }

  async open() {
    await StarCounter.update();
    await showElement(this.id);
    document.getElementById(this.id).focus();
  }

  async close() {
    await hideElement(this.id);
  }

  async updateTaskGroup() {
    const viewedTasks = document.getElementById("viewed-tasks");
    if (viewedTasks) {
      const currentTaskGroup = this.currentTaskGroup;
      viewedTasks.innerHTML = currentTaskGroup ? await currentTaskGroup.renderTaskInventory() : "";
    }
  }

  async showTaskGroup(groupID) {
    if (groupID === "X") return;
    const taskGroup = taskGroups[groupID];
    if (this.currentTaskGroup === taskGroup) return;
    this.currentTaskGroup = taskGroup;
    await inventory.update();
    await this.updateTaskGroup();
    if (DISPLAY_STATE.endgame) {
      await Views.MAP.render();
    }
    if (this.currentTaskGroup) {
      document.getElementById("viewed-tasks-header").focus();
    }
    // Opens the book, when the taskGroup is opened for the first time 
    const newBook = document.getElementById(`Book-`+groupID)?.getElementsByClassName("new-item-highlight");
    if(newBook.length>0){
      document.getElementById(`Book-`+groupID).click();
    }
  }
}

/**
 * Represents the view with a map and small flames.
 *
 * a Main view, use changeView-function with this view.
 */
class MapView extends View {
  constructor() {
    super("map-view");
    this.drawn = false;
  }

  async open() {
    DISPLAY_STATE.endgame = true;
    if (!this.drawn) {
      this.render();
    }
    await ProfileButton.show();
    await TaskViewSwap.show();
    showElement(this.id);
    await StarCounter.update();
    if (DISPLAY_STATE.previousView === Views.FLAME_ANIMATION || DISPLAY_STATE.previousView === Views.END_ANIMATION) {
      clearParticles();
      await fadeFromBlack();
      clearParticles();
    }
    document.getElementById(this.id).focus();
    const tasksForMap = taskGroups["X"];
    if (tasksForMap.getCompletedTaskCount() >= tasksForMap.getTaskCount() && !DISPLAY_STATE.gameCompleted) {
      DISPLAY_STATE.gameCompleted = true;
      changeView(Views.END_ANIMATION);
    }
  }

  async close() {
    await hideElement(this.id);
  }

  async render() {
    // Clears the map of flames
    document.querySelectorAll(".flame-container").forEach((element) => element.remove());

    const mapView = document.getElementById(this.id);
    const flameLocations = [
      [6, 43],
      [7.5, 19],
      [8.5, 34],
      [11.5, 27],
      [15.5, 38],
      [17, 21],
      [18, 28],
      [20, 5.5],
      [21, 42],
      [23, 17],
      [25, 32],
      [27, 25],
      [29, 11],
      [30, 18],
      [31.5, 39],
      [34, 31],
      [36, 46],
      [36.5, 23],
      [38, 10],
      [40.5, 8],
      [41, 36.5],
      [42, 15.5],
      [44, 41],
      [44.5, 23.5],
      [47, 29],
      [49, 21],
      [49, 14],
      [53.5, 32],
      [56.5, 15.5],
      [56.5, 39],
      [57, 27],
      [62, 7],
      [62, 33],
      [65, 13],
      [65.5, 26],
      [69.5, 42],
      [70, 20],
      [72, 32],
      [77.5, 27],
      [79.5, 15],
    ];
    const wobble = 0.2;

    if (DISPLAY_STATE.gameCompleted) {
      const taskFlame = new Flame({
        id: `evil-flame-x`,
        evil: true,
        dead: false,
      }).render();
      mapView.innerHTML += `<button class="flame-container" style="position: absolute; 
                    left: calc(${45 + Math.random() * wobble}vw * var(--image-size));
                    top: calc(${44 + Math.random() * wobble}vw * var(--image-size));"
                    onclick="changeView(Views.END_ANIMATION)">
                ${taskFlame}
                <p class="center">${i18n.get("rewatch-animation")}</p>
            </button>`;
    }

    const maxFlame = flameLocations.length;
    const tasksX = taskGroups["X"].tasks;
    for (let i = 0; i < 40; i++) {
      const task = tasks[tasksX[i]];
      const posXMod = -4 + 2.5;
      const posYMod = -7 + 3;
      const left = `calc(${flameLocations[i % maxFlame][0] + posXMod + Math.random() * wobble}vw * var(--image-size))`;
      const top = `calc(${flameLocations[i % maxFlame][1] + posYMod + Math.random() * wobble}vw * var(--image-size))`;
      const onclick = `Views.TASK.show('${tasksX[i] ? tasksX[i] : "task-00" + i}')`;
      const taskFlame = new Flame({
        id: `evil-flame-${i}`,
        evil: true,
        dead: task && task.completed,
      }).render();
      document.getElementById(
        "map-tasks"
      ).innerHTML += `<button class="flame-container" style="position: absolute; left: ${left}; top: ${top};" onclick="${onclick}" role="button">
                ${task && task.completed ? '<i class="fa fa-star col-yellow"></i>' : taskFlame}
                <p class="center">#${Task.getNumericID(tasksX[i])}</p>
            </button>`;
    }
    this.drawn = true;
  }
}

/**
 * Represents the view with task description and query stuff.
 *
 * a Main view, use changeView-function with this view.
 */
class TaskView extends View {
  constructor() {
    super("task-view");
    this.queryInputField = document.getElementById("query-input");
    this.parsonsInputDiv = document.getElementById("parsons-input");
    this.currentTask = null;
    this.selectedPreviousAnswer = false;
    this.parsons = null;
  }

  async open() {
    await showElement(this.id);
    document.getElementById(this.id).focus();
  }

  async close() {
    this.currentTask = null;
    await hideElement(this.id);
    removePreservedTaskBoxHeight();
  }

  async updateTaskCompleteMarker() {
    const currentTask = this.currentTask;

    if (!currentTask) return;
    document.getElementById("task-completed-text").innerHTML = currentTask.completed
      ? `<p class="center col-yellow"><i class="fa fa-star" title="${i18n.get("task-complete")}" aria-label="${i18n.get(
          "task-complete"
        )}"></i></p>`
      : `<p class="center col-yellow"><i class="far fa-star" title="${i18n.get(
          "task-incomplete"
        )}" aria-label="${i18n.get("task-incomplete")}"></i></p>`;
  }

  initParsonsProblem() {
    var initial = this.currentTask.parsons.join("\n");
    this.parsons = new ParsonsWidget({
      sortableId: "parsons-sortable",
      trashId: "parsons-sortableTrash",
      can_indent: false,
    });
    this.parsons.init(initial);
    this.parsons.shuffleLines();
    $("#query-run-button")
      .off()
      .on("click", function (e) {
        e.preventDefault();
        Views.TASK.parsons.getFeedback();
        // Translate parsons input to query input
        const parsonsInput = $("#parsons-sortable ul.output > li")
          .toArray()
          .map((m) => $(m).text())
          .join(" ")
          .trim();
        if (parsonsInput) $("#query-input").val(parsonsInput);

        runQueryTests(true);
      });
    $("#reset-input-button")
      .off()
      .on("click", function (e) {
        e.preventDefault();
        var initial = Views.TASK.currentTask.parsons.join("\n");
        Views.TASK.parsons.init(initial);
        Views.TASK.parsons.shuffleLines();
       });
  }

  async toggleAnswer() {
    const currentTask = this.currentTask;
    if (!currentTask) return;

    document.getElementById("model-answer").value = currentTask.answer;
    if (document.getElementById("model-answer").classList.contains("hidden")) {
      await showElementImmediately("model-answer");
    } else {
      await hideElementImmediately("model-answer");
    }
  }

  getTaskBookName(){
    for (let group of taskGroups.asList()) {
      for (let taskName of group.tasks) {
        // console.log(taskName, this.currentTask.id, taskName === this.currentTask.id)
        if (taskName === this.currentTask.id) {
            return(getItem(group.book).shortName)
        }
      }
    }
    return("Book")
  }

  async showWithQuery(query) {
    await hideElementImmediately("model-answer");
    await hideElementImmediately("task-next-button");
    await hideElementImmediately("query-model-button");
    const task = this.currentTask;
    if (task instanceof LazyTask && !task.loaded) await task.loadTask();

    document.getElementById("task-name").innerText = this.getTaskBookName() + " - " + i18n.getWith("task", [task.getNumericID()]);
    await this.updateTaskCompleteMarker();
    const taskDescription = document.getElementById("task-description");
    taskDescription.innerHTML = i18n.get(task.description);
    // if (DISPLAY_STATE.endgame) { // Adds purple color to task view, disabled. Uncomment to enable
    // document.getElementById('task-view').classList.add('evil')
    // taskDescription.classList.remove('task-description');
    // taskDescription.classList.add('evil-task-description');
    // }
    this.updateFlame();

    document.getElementById("query-in-table").innerHTML = await task.renderTaskTables();
    document.getElementById("query-out-table").innerHTML = "";
    document.getElementById("query-out-tables-nav").innerHTML = "";
    this.queryInputField.value = query ? query : i18n.get("query-placeholder");

    // Display the right input [query / parsons]
    if (task.parsons) {
      await showElementImmediately("parsons-input");
      await hideElementImmediately("query-input");
      this.initParsonsProblem();
    } else {
      await showElementImmediately("query-input");
      await hideElementImmediately("parsons-input");
      $("#query-run-button")
        .off()
        .on("click", function (e) {
          e.preventDefault();
          runQueryTests(true);
        });
      $("#reset-input-button")
        .off()
        .on("click", function (e) {
          e.preventDefault();
          query = null;
          this.queryInputField = document.getElementById("query-input").value =  i18n.get("query-placeholder");
        });
    }

    if (API.loginStatus === LoginStatus.LOGGED_IN) {
      this.loadPreviousAnswers(task);
    }

    await changeView(this);
  }

  async loadPreviousAnswers(task) {
    await this.renderPreviousAnswers(task, true);
  }

  async updatePreviousAnswers(task) {
    await this.renderPreviousAnswers(task, false);
  }

  async renderPreviousAnswers(task, changeQuery) {
    const profile = await API.self();
    const previousAnswers = _.orderBy(profile.history[task.id], ["date"], ["desc"]);
    const dropdown = document.getElementById("previous-answers-dropdown");
    if (dropdown && previousAnswers.length) {
      if (changeQuery) await this.setQuery(previousAnswers[0].query); // First entry is latest answer
      let render = "";
      for (let answer of previousAnswers) {
        let selected = !render;
        render += `<button class="dropdown-item${selected ? " selected" : ""}" role="option" data-query="${
          answer.query
        }" onclick="Views.TASK.selectPreviousAnswer(event)">
                ${
                  answer.correct
                    ? `<i class="fa fa-fw fa-check col-green" aria-label="${i18n.get("correct")}"></i>`
                    : `<i class="fa fa-fw fa-times col-red" aria-label="${i18n.get("incorrect")}"></i>`
                } ${moment(answer.date).format("MMMM Do YYYY, H:mm:ss")}
            </button>`;
      }
      dropdown.innerHTML = render;

      this.selectedPreviousAnswer = true;
      await showElementImmediately("previous-answers");
    } else {
      await hideElementImmediately("previous-answers");
    }
  }

  async selectPreviousAnswer(event) {
    const query = event.target.dataset.query;
    this.unsetPreviousAnswerSelection();
    event.target.classList.add("selected");
    this.selectedPreviousAnswer = true;
    await this.setQuery(query);
  }

  unsetPreviousAnswerSelection() {
    document.querySelectorAll(".dropdown-item.selected").forEach((item) => item.classList.remove("selected"));
    this.selectedPreviousAnswer = false;
  }

  updateFlame() {
    const flame = new Flame({
      id: "task-flame",
      evil: DISPLAY_STATE.endgame,
      dead:
        DISPLAY_STATE.endgame && this.currentTask && this.currentTask.completed && this.currentTask.getNumericID() > 60,
    });
    document.getElementById("task-flame-container").innerHTML = flame.render();
  }

  async show(taskID) {
    this.currentTask = tasks[taskID];
    try {
      await this.showWithQuery();
    } catch (e) {
      showError(e);
    }
  }

  async setQuery(query) {
    this.queryInputField.value = query;
    if (this.currentTask.parsons && this.parsons) this.parsons.setStateByQuery(query);
    await runQueryTests(false);
  }
}

/**
 * View where letters are read.
 *
 * a Secondary view, use changeSecondaryView-function with this view.
 */
class ShowItemView extends View {
  constructor() {
    super("display-letter-modal");
    this.shownItem = null;
  }

  async open() {
    this.shownItem.onShow();
    const trigger = document.activeElement;
    document.getElementById(this.id).focus();
    await showModal("#" + this.id, DISPLAY_STATE.previousSecondaryView, trigger);
  }

  async close() {
    this.shownItem = null;
    $("#" + this.id).modal("hide");
    Views.INVENTORY.showTaskGroup("A");
  }

  setupModal() {
    const item = this.shownItem;
    document.getElementById("display-letter-text").innerHTML = i18n.get(item.discoverText);
  }

  async show(itemID) {
    this.shownItem = getItem(itemID);
    this.setupModal();
    await changeSecondaryView(this);
  }
}

/**
 * View where books are read.
 *
 * a Secondary view, use changeSecondaryView-function with this view.
 */
class ReadBookView extends View {
  constructor() {
    super("display-book-modal");
    this.currentBook = null;
    this.shownBookPage = 0;
  }

  async open() {
    const trigger = document.activeElement;
    // console.log(this.id, document.getElementById(this.id))
    if (!DISPLAY_STATE.editMode)  document.getElementById(this.id).focus();
    await showModal("#" + this.id, DISPLAY_STATE.previousSecondaryView, trigger);
  }

  async close() {
    $("#" + this.id).modal("hide");
    this.currentBook = null;
  }

  setupModal(item) {
    if (item) {
      const currentPage = this.shownBookPage;
      document.getElementById("display-book-title").innerHTML = i18n.get(item.shortName);
      document.getElementById("display-book").innerHTML = item.renderBook(this.shownBookPage);
      const prev = document.getElementById("display-prev-page");
      const next = document.getElementById("display-next-page");
      if (currentPage === 0) {
        prev.setAttribute("disabled", "true");
        prev.style.opacity = "0";
      } else {
        prev.removeAttribute("disabled");
        prev.style.opacity = "1";
      }

      if (currentPage + 2 >= item.pages) {
        next.setAttribute("disabled", "true");
        next.style.opacity = "0";
      } else {
        next.removeAttribute("disabled");
        next.style.opacity = "1";
      }
    } else {
      const contents = taskGroups
        .asList()
        .filter((taskGroup) => taskGroup.unlocked)
        .map((taskGroup) => taskGroup.book);
      const colWidth = contents.length === 1 ? 12 : contents.length === 2 ? 6 : 4;
      let render = '<div class="clickable-items row justify-content-center">';
      for (let itemID of contents) {
        if (itemID === "Book-X") continue;
        let item = getItem(itemID);
        render += `<button class="item col-md-${colWidth}" id="${item.id}" onclick="${item.onclick}">
                    ${item.renderShowItem()}
                    <p>${i18n.get(item.shortName)}</p>
                </button>`;
      }
      render += "</div>";
      document.getElementById("display-book-title").innerHTML = i18n.get("books-text");
      document.getElementById("display-book").innerHTML = render;
    }
  }

  async showTheBook() {
    this.setupModal(this.currentBook);
    await changeSecondaryView(this);
    document.getElementById(this.id).focus();
  }

  async show(event, itemID) {
    event.stopPropagation();
    if (itemID) {
      this.currentBook = items[itemID];
      this.shownBookPage = 0;
      this.currentBook.newItem = false;
      await Views.INVENTORY.updateTaskGroup(); // New item indicator changed
    }
    await this.showTheBook();
    await inventory.removeItem(itemID);
    if (!DISPLAY_STATE.bookMenuUnlocked) {
      await BookMenuButton.unlock();
    }
  }

  async nextPage() {
    playSoundById("sound_book_page_turn");
    this.shownBookPage += 2;
    await this.showTheBook();
  }

  async previousPage() {
    playSoundById("sound_book_page_turn");
    this.shownBookPage -= 2;
    await this.showTheBook();
  }
}

/**
 * View where user can look at their profile
 *
 * a Secondary view, use changeSecondaryView-function with this view.
 */
class ProfileView extends View {
  constructor() {
    super("display-profile-modal");
    this.graph = undefined;
  }

  async open() {
    const userProfile = await API.self();
    let extraData = ""

    if (API.isSWITCHaaiLogin()) {
      extraData += ` </br> (user ${userProfile.uid} at ${userProfile.org})`;
      extraData += ` </br> ${userProfile.givenname} ${userProfile.surname}`;
    }
    document.getElementById("logged-in-as").innerHTML = i18n.getWith("logged-in-as", [userProfile.username + extraData]);
    document.getElementById("task-completion-grid").innerHTML = this.renderTaskCompletionGrid();
    document.getElementById("select-certificates").innerHTML = this.renderSelectCertificatesList(userProfile.certificates);

    const trigger = document.activeElement;
    document.getElementById(this.id).focus();
    // Uncomment this to render the graph
    // this.renderGraph(); 
    await showModal("#" + this.id, DISPLAY_STATE.previousSecondaryView, trigger);
  }

  async close() {
    $("#" + this.id).modal("hide");
  }

  renderTaskCompletionGrid() {
    let i = 0;
    let render = "<tbody><tr>";
    const orderedTaskList = tasks.asList().sort(function (x, y) {
      return x.id.substring(5)- y.id.substring(5);
    }); 
    for (const task of orderedTaskList){
      render += `<td class="${task.completed ? "completed" : ""}">${task.getNumericID()}</td>`;
      i++;
      if (i % 10 === 0) {
        render += `</tr><tr>`;
      }
    }
    return render + "</tr></tbody>";
  }

  renderSelectCertificatesList(certificates){
    // console.log(certificates)
    if (certificates && certificates.length > 0) {
      let options = ""
      for (let certificate of certificates) {
        let date = new Date(certificate.date).toISOString().split('T')[0]
        options += `<option value="${certificate._id}">${date} - ${certificate.stars} ${i18n.get("certificates-stars")}</option>\n`
      }
      return options
    }     
    return '<option value="">' + i18n.get("no-certificates")+'</option>';
  }

  async downloadData() {
    const data = await API.self();
    saveFile("sqltrainer-sent-answers.json", JSON.stringify(data.history));
  }

  async showCertificate(){
    const data = await API.self();
    const certificates = data.certificates;
    const selectedId = document.getElementById("select-certificates").value

    if (certificates && selectedId) {
      let selectedCertificate = undefined

      for (let certificate of certificates) {
        if (certificate._id == selectedId) selectedCertificate = certificate
      }
      if (selectedCertificate) {
        console.log("show certificate " + selectedId + JSON.stringify(selectedCertificate))

        $.get('certificate.html', null, function(text){

          let mywindow = window.open('', 'CERTIFICATE', 'height=850,width=1200,top=100,left=150');
          mywindow.document.write(text);

          mywindow.document.getElementById("p-certificate-data").innerHTML = JSON.stringify(selectedCertificate);

          mywindow.document.getElementById("certificate-id").innerHTML = selectedCertificate._id;
          mywindow.document.getElementById("certificate-name").innerHTML = selectedCertificate.name;
          mywindow.document.getElementById("certificate-email").innerHTML = selectedCertificate.email;
          mywindow.document.getElementById("certificate-date").innerHTML = new Date(selectedCertificate.date).toISOString().split('T')[0];
          mywindow.document.getElementById("certificate-stars").innerHTML = selectedCertificate.stars;

          mywindow.document.close(); // necessary for IE >= 10
          mywindow.focus(); // necessary for IE >= 10*/

          var element = mywindow.document.body;
          var opt = {
            filename: `sqlscrolls_certificate_${selectedCertificate._id}.pdf`,
            margin:       0,
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
          };

          // New Promise-based usage:
          html2pdf().set(opt).from(element).save();

        });
      }
    }
  }

  async generateCertificate() {
    const data = await API.generateCertificate();
    console.log("generateCertificate", data)
  }

  // Graph is currently not rendered due to a bug in displaying the data
  async renderGraph() {
    const loadingIcon = document.querySelector(".graph-loading");
    loadingIcon.classList.remove("hidden");
    const userProfile = await API.self();

    // Transform Data
    const historyData = [].concat(...Object.entries(userProfile.history).map((m) => m[1])).filter((m) => m.correct);
    var groups = _.groupBy(historyData, (m) => moment(m.date).startOf("day").format());
    var chartData = Object.entries(groups).map((m) => [new Date(m[0]), m[1].length]);

    if (this.graph) {
      this.graph.updateOptions({ file: chartData });
    } else {
      this.graph = new Dygraph(document.getElementById("task-completion-graph"), chartData, {
        labels: [i18n.get("time"), i18n.get("completed-tasks")],
        colors: ["#f2cd60"],
        customBars: false,
        showRangeSelector: true,
        rangeSelectorPlotStrokeColor: "#f2cd60",
        rangeSelectorPlotFillColor: "",
        strokeWidth: 1,
        includeZero: true,
      });
    }
    loadingIcon.classList.add("hidden");
  }
}

/**
 * View where people login
 *
 * a Main view, use changeView-function with this view.
 */
class LoginView extends View {
  constructor() {
    super("login-view");
  }

  async open() {
    await showElement(this.id);
  }

  async close() {
    await hideElement(this.id);
    await this.clearLoginError();
    // Clear user information from dom
    document.getElementById("inputLoginUser").value = "";
    document.getElementById("inputLoginPassword").value = "";
  }

  startLogin() {
    const loginButton = document.getElementById("login-button");
    loginButton.innerHTML =
      `<span id="loading-animation">
            <i class="fa fa-star loading-animation"></i>
            <i class="far fa-star loading-animation offset"></i>
        </span>` + loginButton.innerHTML;
    loginButton.setAttribute("disabled", "true");
    loginButton.setAttribute("aria-disabled", "true");
  }

  endLogin() {
    const loginButton = document.getElementById("login-button");
    document.getElementById("loading-animation").remove();
    loginButton.removeAttribute("disabled");
    loginButton.setAttribute("aria-disabled", "false");
  }

  async loginSWITCHaai(authCookie){
    try {
      await API.loginSWITCHaai(authCookie);
      if (API.loginStatus === LoginStatus.ERRORED) {
        await this.showLoginError(i18n.get("login-error-failed-unknown"));
      } else if (API.loginStatus === LoginStatus.LOGGED_IN) {
        changeView(Views.LOADING);
        await showElementImmediately("loading-view");
        await showElementImmediately("counter-container");
        await showElementImmediately("right-sidebar");
        loadCompletionFromQuizzes();
      }
    } catch (e) {
      await this.showLoginError(e);
    }
  }

  async login() {
    await this.clearLoginError();

    // Validate username
    const username = document.getElementById("inputLoginUser").value;
    if (!username) return await this.showLoginError(i18n.get("error-no-user"));
    if (!username.includes("@")) return await this.showLoginError(i18n.get("error-invalid-user"));

    // FHNW specific validation
    if ((username.endsWith("@fhnw.ch") || (username.endsWith(".fhnw.ch")))) return await this.showLoginError(i18n.get("error-fhnw-user"));

    // Validate password
    const password = document.getElementById("inputLoginPassword").value;
    if (!password) return await this.showLoginError(i18n.get("error-no-password"));

    this.startLogin();
    try {
      await API.login(username, password);
      if (API.loginStatus === LoginStatus.ERRORED) {
        await this.showLoginError(i18n.get("login-error-failed-unknown"));
      } else if (API.loginStatus === LoginStatus.LOGGED_IN) {
        changeView(Views.LOADING);
        await showElementImmediately("loading-view");
        await showElementImmediately("counter-container");
        await showElementImmediately("right-sidebar");
        loadCompletionFromQuizzes();
      }
    } catch (e) {
      await this.showLoginError(e);
    }
    this.endLogin();
  }

  async clearLoginError() {
    await this.showLoginError();
  }

  async showLoginError(error) {
    if (!error) return await hideElement("login-error");
    document.getElementById("login-error").innerText = error;
    await showElement("login-error");
  }
}

/**
 * View where people register
 *
 * a Main view, use changeView-function with this view.
 */
class RegisterView extends View {
  constructor() {
    super("register-view");
  }

  async open() {
    await showElement(this.id);
  }

  async close() {
    await hideElement(this.id);
    await this.clearRegisterAlerts();
    // Clear user information from dom
    document.getElementById("inputRegisterUser").value = "";
    document.getElementById("inputRegisterPassword").value = "";
    document.getElementById("inputRegisterPasswordVerify").value = "";
  }

  async register() {
    await this.clearRegisterAlerts();

    // Validate User
    const username = document.getElementById("inputRegisterUser").value;
    if (!username) return await this.showRegisterError(i18n.get("error-no-user"));
    if (!username.includes("@")) return await this.showRegisterError(i18n.get("error-invalid-user"));

    if ((username.endsWith("@fhnw.ch") || (username.endsWith(".fhnw.ch")))) return await this.showRegisterError(i18n.get("error-fhnw-user"));

    // Validate Password
    const password = document.getElementById("inputRegisterPassword").value;
    if (!password) return await this.showRegisterError(i18n.get("error-no-password"));
    const passwordVerify = document.getElementById("inputRegisterPasswordVerify").value;
    if (!passwordVerify || passwordVerify !== password)
      return await this.showRegisterError(i18n.get("error-password-missmatch"));

    this.startRegister();

    try {
      await API.register(username, password);
      this.showRegisterSuccess(i18n.get("register-success"));
      this.endRegister();
      await delay(1500);
      changeView(Views.LOGIN);
    } catch (err) {
      await this.showRegisterError(err.message);
      this.endRegister();
    }
  }

  startRegister() {
    const registerButton = document.getElementById("register-button");
    registerButton.innerHTML =
      `<span id="loading-animation">
            <i class="fa fa-star loading-animation"></i>
            <i class="far fa-star loading-animation offset"></i>
        </span>` + registerButton.innerHTML;
    registerButton.setAttribute("disabled", "true");
    registerButton.setAttribute("aria-disabled", "true");
  }

  endRegister() {
    const registerButton = document.getElementById("register-button");
    document.getElementById("loading-animation").remove();
    registerButton.removeAttribute("disabled");
    registerButton.setAttribute("aria-disabled", "false");
  }

  async clearRegisterAlerts() {
    await this.showRegisterError();
    await this.showRegisterSuccess();
  }

  async showRegisterSuccess(msg) {
    if (!msg) return await hideElement("register-success");
    document.getElementById("register-success").innerText = msg;
    await showElement("register-success");
  }

  async showRegisterError(error) {
    if (!error) return await hideElement("register-error");
    document.getElementById("register-error").innerText = error;
    await showElement("register-error");
  }
}

/**
 * View where people sent ask for a recovery link of their password
 *
 * a Main view, use changeView-function with this view.
 */
class ForgotPasswordView extends View {
  constructor() {
    super("forgot-password-view");
  }

  async open() {
    await showElement(this.id);
    await showElementImmediately("inputForgotPasswordUser");
    await showElementImmediately("forgot-password-button");
  }

  async close() {
    await hideElement(this.id);
    await this.clearForgotPasswordAlerts();
    document.getElementById("inputForgotPasswordUser").value = "";
  }

  async forgotPassword() {
    await this.clearForgotPasswordAlerts();

    // Validate User
    const username = document.getElementById("inputForgotPasswordUser").value;
    if (!username) return await this.showForgotPasswordError(i18n.get("error-no-user"));
    if (!username.includes("@")) return await this.showForgotPasswordError(i18n.get("error-invalid-user"));

    if ((username.endsWith("@fhnw.ch") || (username.endsWith(".fhnw.ch")))) return await this.showForgotPasswordError(i18n.get("error-fhnw-user"));

    this.startForgotPassword();
    try {
      await API.recoverPassword(username);
      this.showForgotPasswordSuccess(i18n.get("forgot-password-success"));
      this.endForgotPassword();
    } catch (err) {
      await this.showForgotPasswordError(err.message);
      this.endForgotPassword();
    }
  }

  startForgotPassword() {
    const forgotPasswordButton = document.getElementById("forgot-password-button");
    forgotPasswordButton.innerHTML =
      `<span id="loading-animation">
            <i class="fa fa-star loading-animation"></i>
            <i class="far fa-star loading-animation offset"></i>
        </span>` + forgotPasswordButton.innerHTML;
    forgotPasswordButton.setAttribute("disabled", "true");
    forgotPasswordButton.setAttribute("aria-disabled", "true");
  }

  endForgotPassword() {
    const forgotPasswordButton = document.getElementById("forgot-password-button");
    document.getElementById("loading-animation").remove();
    forgotPasswordButton.removeAttribute("disabled");
    forgotPasswordButton.setAttribute("aria-disabled", "false");
  }

  async clearForgotPasswordAlerts() {
    await this.showForgotPasswordError();
    await this.showForgotPasswordSuccess();
  }

  async showForgotPasswordSuccess(msg) {
    if (!msg) return await hideElement("forgot-password-success");
    document.getElementById("forgot-password-success").innerText = msg;
    await hideElementImmediately("inputForgotPasswordUser");
    await hideElementImmediately("forgot-password-button");
    await showElement("forgot-password-success");
  }

  async showForgotPasswordError(error) {
    if (!error) return await hideElement("forgot-password-error");
    document.getElementById("forgot-password-error").innerText = error;
    await showElement("forgot-password-error");
  }
}

/**
 * View where people reset their password with a given token
 *
 * a Main view, use changeView-function with this view.
 */
class ResetPasswordView extends View {
  constructor() {
    super("reset-password-view");
  }

  async open() {
    await showElement(this.id);
    document.getElementById("inputResetPassword").value = "";
    document.getElementById("inputResetPasswordVerify").value = "";
    await showElementImmediately("inputResetPassword");
    await showElementImmediately("inputResetPasswordVerify");
    await showElementImmediately("reset-password-button");
  }

  async close() {
    await hideElement(this.id);
    await this.clearResetPasswordAlerts();
    window.location.search = "";
  }

  startResetPassword() {
    const resetPasswordButton = document.getElementById("reset-password-button");
    resetPasswordButton.innerHTML =
      `<span id="loading-animation">
            <i class="fa fa-star loading-animation"></i>
            <i class="far fa-star loading-animation offset"></i>
        </span>` + resetPasswordButton.innerHTML;
    resetPasswordButton.setAttribute("disabled", "true");
    resetPasswordButton.setAttribute("aria-disabled", "true");
  }

  endResetPassword() {
    const resetPasswordButton = document.getElementById("reset-password-button");
    document.getElementById("loading-animation").remove();
    resetPasswordButton.removeAttribute("disabled");
    resetPasswordButton.setAttribute("aria-disabled", "false");
  }

  async resetPassword() {
    await this.clearResetPasswordAlerts();

    // Validate Password
    const password = document.getElementById("inputResetPassword").value;
    if (!password) return await this.showResetPasswordError(i18n.get("error-no-password"));
    const passwordVerify = document.getElementById("inputResetPasswordVerify").value;
    if (!passwordVerify || passwordVerify !== password)
      return await this.showResetPasswordError(i18n.get("error-password-missmatch"));

    const token = document.getElementById("inputResetPasswordToken").value;
    this.startResetPassword();
    try {
      await API.resetPassword(password, token);
      this.showResetPasswordSuccess(i18n.get("reset-password-success"));
    } catch (err) {
      await this.showResetPasswordError(err.message);
    }
    this.endResetPassword();
  }

  async clearResetPasswordAlerts() {
    await this.showResetPasswordError();
    await this.showResetPasswordSuccess();
  }

  async showResetPasswordSuccess(msg) {
    if (!msg) return await hideElement("reset-password-success");
    document.getElementById("reset-password-success").innerText = msg;
    await hideElementImmediately("inputResetPassword");
    await hideElementImmediately("inputResetPasswordVerify");
    await hideElementImmediately("reset-password-button");
    await showElement("reset-password-success");
  }

  async showResetPasswordError(error) {
    if (!error) return await hideElement("reset-password-error");
    document.getElementById("reset-password-error").innerText = error;
    await showElement("reset-password-error");
  }
}

/**
 * Transition view from login to the game while the necessary files are loaded.
 *
 * Automatically transitions to MAP or INVENTORY view afterwards.
 *
 * a Main view, use changeView-function with this view.
 */
class LoadingView extends View {
  constructor() {
    super("loading-view");
  }

  async open() {
    document.getElementById("body").classList.add("no-focus-outline");
    await showElementImmediately(this.id);
    document.getElementById(this.id).focus();
    await awaitUntil(() => DISPLAY_STATE.loaded && DISPLAY_STATE.saveLoaded);
    await changeView(DISPLAY_STATE.endgame ? Views.MAP : Views.INVENTORY);
  }

  async close() {
    await fadeFromBlack();
    await hideElement(this.id);
  }
}

/**
 * View for the flame turning animation
 *
 * a Main view, use changeView-function with this view.
 */
class FlameAnimationView extends View {
  constructor() {
    super("evil-flame-animation");
  }

  async open() {
    await fadeToBlack();
    document.getElementById("body").style.overflow = "hidden";
    await showElementImmediately(this.id);
    document.getElementById(this.id).focus();
    await ProfileButton.hide();
    await BookMenuButton.hide();
    await TaskViewSwap.hide();
    await delay(500);
    await fadeFromBlack();
    if (DISPLAY_STATE.endgame) await resetFlameAnimation();
    await evilFlameAnimation();
  }

  async close() {
    await fadeToBlack();
    await hideElementImmediately(this.id);
    await BookMenuButton.show();
    document.getElementById("body").style.overflow = "";
  }

  async startEndGame() {
    await changeSecondaryView(Views.NONE);
    await changeView(Views.FLAME_ANIMATION);
    // await inventory.setAsViewed("item-999");
  }
}

/**
 * View for the end animation
 *
 * a Main view, use changeView-function with this view.
 */
class EndAnimationView extends View {
  constructor() {
    super("end-animation");
  }

  async open() {
    await fadeToBlack();
    document.getElementById("body").style.overflow = "hidden";
    await showElementImmediately(this.id);
    document.getElementById(this.id).focus();
    await ProfileButton.hide();
    await BookMenuButton.hide();
    await TaskViewSwap.hide();
    await delay(500);
    await fadeFromBlack();
    if (DISPLAY_STATE.gameCompleted) await resetEndAnimation();
    await endAnimation();
  }

  async close() {
    await Views.MAP.render();
    await fadeToBlack();
    await hideElementImmediately(this.id);
    document.getElementById("body").style.overflow = "";
    await StarCounter.update();
  }
}

/**
 * View for the end text
 *
 * a Main view, use changeView-function with this view.
 */
class EndTextView extends View {
  constructor() {
    super("end-view");
  }

  async open() {
    eventQueue.clear();
    clearParticles();
    await showElementImmediately(this.id);
    document.getElementById(this.id).focus();
    await BookMenuButton.hide();
    await ProfileButton.show();
    await fadeFromBlack();
    endScreenAnimation();
  }

  async close() {
    await hideElement(this.id);

    await BookMenuButton.show();
    //await TaskViewSwap.show();
    await ProfileButton.show();
  }
}

Views = {
  INVENTORY: new InventoryView(),
  MAP: new MapView(),
  TASK: new TaskView(),
  SHOW_ITEM: new ShowItemView(),
  READ_BOOK: new ReadBookView(),
  LOGIN: new LoginView(),
  REGISTER: new RegisterView(),
  FORGOT_PASSWORD: new ForgotPasswordView(),
  RESET_PASSWORD: new ResetPasswordView(),
  PROFILE: new ProfileView(),
  LOADING: new LoadingView(),
  FLAME_ANIMATION: new FlameAnimationView(),
  END_ANIMATION: new EndAnimationView(),
  END_TEXT: new EndTextView(),
  NONE: new View(),
};
