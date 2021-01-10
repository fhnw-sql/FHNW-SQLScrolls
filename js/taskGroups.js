// Task groups are filled in main.js#initializeGameDictionaries
const taskGroups = {
    asList() {
        return Object.values(this).filter(obj => obj instanceof TaskGroup);
    },
    lookupTaskGroupWithTaskId(taskID) {
        for (let taskGroup of this.asList()) {
            if (taskGroup.tasks.includes(taskID)) return taskGroup;
        }
        return null;
    },
    getCompletedTaskCount() {
        return this.asList()
            .map(taskGroup => taskGroup.getCompletedTaskCount())
            .reduce((total, num) => total + num, 0)
    },
    getTaskCount() {
        return this.asList()
            .map(taskGroup => taskGroup.getTaskCount())
            .reduce((total, num) => total + num, 0)
    }
};

/**
 * Represents a group of tasks the player needs to complete.
 */
class TaskGroup extends ItemType {
    /**
     * Construct a new TaskGroup.
     *
     * id          ID in taskGroups variable
     * tasks       List of Task IDs, without 'task-' in front eg 000, 001 etc
     * unlocked    boolean, has this task group been unlocked
     * newItem     boolean, is this item new to the player
     * book        Book ID that is related to this TaskGroup
     * requires    Array of task group IDs that this task group requires for unlock
     * requiredBy  Array of task group IDs that this task group is required for
     *
     * @param options {id, tasks, unlocked, newItem, book, requires, requiredBy}
     */
    constructor(options) {
        super({
            item: new ImageItem({
                id: `task-group-${options.id}`,
                name: `i18n-group-${options.id}-name`,
                onclick: `Views.INVENTORY.showTaskGroup('${options.id}')`,
                url: './img/scrolls.png',
                alt: "task group ${options.id}"
            }),
            unlocked: false,
            tasks: [],
            newItem: true,
            book: `Book-${options.id}`,
            ...options
        });
        this.tasks = this.tasks.map(task => `task-${task}`);
    }

    getCompletedTaskCount() {
        return this.tasks.filter(taskID => tasks[taskID] && tasks[taskID].completed).length;
    }

    getTaskCount() {
        return this.tasks.filter(taskID => tasks[taskID]).length;
    }

    isCompleted() {
        return this.getCompletedTaskCount() >= this.getTaskCount();
    }

    async render() {
        const completed = this.getCompletedTaskCount();
        const outOf = this.getTaskCount();
        const completedIcon = outOf <= completed ? "<i class='fa fa-fw fa-star col-yellow' aria-hidden='true' '></i>" : '';
        const selected = Views.INVENTORY.currentTaskGroup && Views.INVENTORY.currentTaskGroup.item.id === this.item.id;
        if (selected) this.newItem = false;
        return `<button 
                    id="${this.item.id}"
                    class="item${selected ? " highlighted" : ""} ${this.unlocked ? '' : ' locked'}" 
                    onclick="${this.item.onclick}" 
                    type="button" ${this.unlocked ? '' : 'disabled'}
                    aria-expanded="${!!selected}"
                    aria-disabled="${!this.unlocked}"
                    aria-controls="viewed-tasks"
                    aria-labelledby="${this.item.id}"
                >
                    ${this.item.renderShowItem()}
                    ${this.newItem && this.unlocked ? `<div class="new-item-highlight"><div class="burst-12"> </div></div>` : ''}
                    <p id="task-group-${this.id}-label">${completedIcon} ${completed} / ${outOf}</p>
                </button>`;
    }

    async renderTaskInventory() {
        let html = getItem(this.book).render();

        const rendered = {};
        let loaded = 0;
        let current = 0;
        const toLoad = this.tasks.length;

        async function renderTask(taskID) {
            try {
                // Task line break conditions: (<filter by task count> && current % <split every x tasks>)
                const needsBreak = current !== 0 && (
                    (toLoad > 6 && current % 4 === 0) // 7-8 tasks
                    || (toLoad >= 5 && toLoad < 6 && (current + 1) % 3 === 0) // 5-6 tasks (+1 in here makes first cut at 2 tasks)
                );
                current++;
                rendered[taskID] = await tasks[taskID].render();
                if (needsBreak) {
                    rendered[taskID] = (needsBreak ? `<div class="break"></div>` : '') + rendered[taskID]
                }
            } catch (e) {
                rendered[taskID] = `<button class="item${tasks[taskID].completed ? " done" : ""}">
                    <img class="item-icon" alt="missing task ${taskID}" src="img/scroll.png" draggable="false">
                    <i class="task-group-color fa fa-fw fa-2x fa-bookmark"></i>
                    <p>${taskID} doesn't exist</p>     
                </button>`
            }
            loaded++;
        }

        for (let taskID of this.tasks) {
            renderTask(taskID); // async to load multiple task files at once.
        }
        await awaitUntil(() => loaded >= toLoad);

        for (let taskID of this.tasks) {
            html += rendered[taskID];
        }

        return html;
    }

    async attemptUnlock() {
        for (let required of this.requires) {
            const requiredTaskGroup = taskGroups[required];
            if (!requiredTaskGroup.isCompleted()) {
                return;
            }
        }
        await inventory.setAsNew(this.item.id);
        await inventory.unlock(this.item.id);
        return this;
    }


    async checkGoal() {
        if (this.isCompleted() && !this.completed) {
            eventQueue.push(Views.INVENTORY, async () => {
                this.performUnlock(); // async to avoid animation from blocking opening of the view
            });
            this.completed = true;
        }
    }

    async performUnlock() {
        const notification = document.getElementById('task-group-complete-notification');
        notification.classList.remove('hidden');
        await delay(20);
        notification.classList.add('active');
        BookMenuButton.unlock(); // async to avoid animation from delaying task group unlock
        const relatedTaskGroups = [];
        for (let taskGroupID of this.requiredBy) {
            const unlocked = await taskGroups[taskGroupID].attemptUnlock();
            if (unlocked) relatedTaskGroups.push(unlocked);
        }
        const isLastTaskGroup = relatedTaskGroups.filter(group => group.id === 'X').length !== 0;
        if (isLastTaskGroup) {
            await inventory.unlock('item-999');
            await inventory.setAsNew('item-999');
            document.querySelector('.i18n-unlocked-more-tasks').innerHTML = '';
        }
        await delay(7500);
        notification.classList.remove('active');
        await delay(300);
        notification.classList.add('hidden');
    }

}