async function load(completedTaskIDs) {
  function resetViews() {
    inventory.removeAll();
    for (let task of tasks.asList()) {
      task.completed = false;
    }
    Views.INVENTORY.currentTaskGroup = null;
    DISPLAY_STATE.bookMenuUnlocked = true;
    BookMenuButton.show();
  }

  function determineUnlockedTaskGroups(completedTaskIDs) {
    function setTaskGroupAsUnlocked(groupID) {
      const group = taskGroups[groupID];
      group.newItem = false;
      group.unlocked = true;
      getItem(group.book).newItem = false;
    }

    const unlockedTaskGroups = [];
    for (let taskID of completedTaskIDs) {
      const task = tasks[taskID];
      task.completed = true;

      const group = taskGroups.lookupTaskGroupWithTaskId(taskID);
      const groupID = group.id;
      setTaskGroupAsUnlocked(groupID);
      if (!unlockedTaskGroups.includes(groupID)) {
        unlockedTaskGroups.push(groupID);
      }
      if (group.isCompleted()) {
        group.completed = true;
        group.requiredBy.forEach((groupID) => {
          if (!unlockedTaskGroups.includes(groupID)) {
            unlockedTaskGroups.push(groupID);
            setTaskGroupAsUnlocked(groupID);
          }
        });
      }
    }
    return unlockedTaskGroups;
  }

  async function loadInventory(unlockedTaskGroups) {
    if (!unlockedTaskGroups.includes("A")) {
      await inventory.addItems(["item-00", "task-group-A"]);
    }
    await inventory.addItems(taskGroups.asList().map((taskGroup) => taskGroup.item.id));
    await inventory.removeItem("task-group-X");
    if (unlockedTaskGroups.includes("X")) {
      await inventory.unlock("item-999");
    }
    await inventory.addItem("item-999");
  }

  function loadGameState(unlockedTaskGroups) {
    if (!unlockedTaskGroups.includes("A")) {
      DISPLAY_STATE.bookMenuUnlocked = false;
      BookMenuButton.hide();
    }
    if (unlockedTaskGroups.includes("X")) {
      DISPLAY_STATE.endgame = true;
    }
    if (taskGroups.getCompletedTaskCount() >= taskGroups.getTaskCount()) {
      DISPLAY_STATE.gameCompleted = true;
    }
  }

  async function updateViews(unlockedTaskGroups) {
    if (unlockedTaskGroups.length > 0) {
      // Open the latest unlocked task group.
      const lastTaskGroupID = unlockedTaskGroups[unlockedTaskGroups.length - 1];
      await Views.INVENTORY.showTaskGroup(lastTaskGroupID);
    } else {
      await inventory.update();
      await Views.INVENTORY.updateTaskGroup();
    }
    await StarCounter.update();
  }

  resetViews();
  await awaitUntil(() => DISPLAY_STATE.loaded && items.loaded);
  const unlockedTaskGroups = determineUnlockedTaskGroups(completedTaskIDs);
  // loadInventory async because adding await here broke the game at some point and now there is no time for risks.
  // Possible bug: Might cause the letter to appear on the right on rare occasions,
  //               haven't been able to reproduce that bug consistently.
  loadInventory(unlockedTaskGroups);
  loadGameState(unlockedTaskGroups);
  await updateViews(unlockedTaskGroups);
  DISPLAY_STATE.saveLoaded = true;
}
