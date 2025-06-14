class Inventory {
    constructor(id, defaultContents) {
        this.id = id;
        this.contents = defaultContents ? defaultContents : [];
    }

    async addItem(itemID) {
        if (this.contents.includes(itemID)) return console.warn(`${itemID} add failed, already in inventory`);
        if (!getItem(itemID)) return console.warn(`${itemID} add failed, no such item`);
        this.contents.push(itemID);
        await this.update();
    }

    async addItems(itemIDs) {
        for (let itemID of itemIDs) {
            if (this.contents.includes(itemID)) continue;
            this.contents.push(itemID);
        }
        await this.update();
    }

    async removeItem(itemID) {
        let index = this.contents.indexOf(itemID);
        if (index === -1) return;
        this.contents.splice(index, 1);
        await this.update();
    }

    async removeAll() {
        this.contents.splice(0, 100);
        await this.update();
    }

    async unlock(itemID) {
        getItem(itemID).unlocked = true;
        if (this.contents.includes(itemID)) await this.update();
    }

    async unlockMany(itemIDs) {
        for (let itemID of itemIDs) {
            getItem(itemID).unlocked = true;
        }
        await this.update();
    }

    async setAsNew(itemID) {
        getItem(itemID).newItem = true;
        if (this.contents.includes(itemID)) await this.update();
    }

    async setAsViewed(itemID) {
        getItem(itemID).newItem = false;
        if (this.contents.includes(itemID)) await this.update();
    }

    async setAsViewedMany(itemIDs) {
        for (let itemID of itemIDs) {
            getItem(itemID).newItem = false;
        }
        await this.update();
    }

    async update() {
        const inventoryElement = document.getElementById(this.id);
        if (!inventoryElement) return;
        inventoryElement.innerHTML = await this.render();
    }

    async render() {
        let render = '';
        for (let itemID of this.contents) {
            let item = getItem(itemID);
            if (item) {
                render += await item.render();
            }
        }
        return render;
    }
}

const inventory = new Inventory('inventory', ['item-00', 'task-group-A']);