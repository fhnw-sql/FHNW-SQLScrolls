const items = {
    loaded: false,
    asList() {
        return Object.values(this).filter((obj) => obj instanceof ItemType);
    },
    getIDs() {
        return Object.keys(this).filter((key) => this[key] instanceof ItemType);
    },
};

async function loadItems() {
    for (let item of [
        new ImageItem({
            id: `item-00`,
            url: "img/letter.png",
            alt: "i18n-describe-letter",
            unlocks: [],
            newItem: true,
            accessByTab: true,
            onShow: () => inventory.removeItem("item-00"),
        }),
        // new ImageItem({
        //   id: `item-999`,
        //   url: "img/questionmark.png",
        //   alt: "i18n-describe-questionmark",
        //   unlocks: [],
        //   newItem: false,
        //   unlocked: false,
        //   accessByTab: true,
        //   onclick: "Views.FLAME_ANIMATION.startEndGame()",
        // }),
    ]) {
        items[item.id] = item;
    }

    async function loadBooks() {
        let loaded = 0;

        async function loadBookFor(taskGroup) {
            try {
                const item = new BookItem({
                    accessByTab: true,
                    parsed: await parseBookFrom(`books/${currentLang}/${taskGroup.book}.book`),
                });
                items[item.id] = item;
            } catch (e) {
                console.warn(`Book by id ${taskGroup.book} not found: ${e}`);
            }
            loaded++;
        }

        let toLoad = 0;

        for (let taskGroup of taskGroups.asList()) {
            toLoad++;
            loadBookFor(taskGroup); // async to load multiple book files at once.
        }
        await awaitUntil(() => loaded >= toLoad);
    }

    await loadBooks();
    items.loaded = true;
}

function getItem(itemID) {
    function getSomeItem(itemID) {
        if (itemID.includes("item-") || itemID.includes("Book-")) {
            return items[itemID];
        } else if (itemID.includes("task-group-")) {
            return taskGroups[itemID.substr(11)];
        } else if (itemID.includes("task-")) {
            return tasks[itemID];
        }
    }

    const some = getSomeItem(itemID);
    return some
        ? some
        : new ImageItem({
            id: itemID,
            name: "Missing " + itemID + " see console.",
            url: "img/glass-jar.png",
            onclick: "",
        });
}

async function loadKeywordsData(currentLang) {
    try {
        const response = await fetch(`books/${currentLang}/keywords_data.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.Keywords;
    } catch (error) {
        console.error("Failed to load keywords data:", error);
        return [];
    }
}

async function createBookFromKeywords(taskId) {
    try {
        const keywordsData = await loadKeywordsData(currentLang);
        const taskFilePath = `tasks/${currentLang}/${taskId}.task`;
        const task = await parseTaskFrom(taskFilePath);


        if (task.metadata && task.metadata.keywords) {
            const keywords = task.metadata.keywords.split(',').map(keyword => keyword.trim());

            const bookId = `Book-${taskId}`;
            const bookMetadata = `METADATA {
                              id: ${taskId}
                              name: theory task
                              title: ${task.metadata.title || "Generated Title"}
                              author: ${task.metadata.author || "Unknown Author"}
                              color: ${task.metadata.color || "default"}
                            }`;

            const pagesWithKeywords = keywords.map(keyword => {
                const keywordData = keywordsData.find(k => k.keyword === keyword) || {};
                const description = keywordData.description || 'No description available.';
                const example = keywordData.example ? `\n${keywordData.example}\n` : 'No example available.';
                return `PAGE {
                      <h2>${keyword}</h2>
                      <p>${description}</p>
                      <p>Example:</p>
                      ${example}
                      }`;
            }).join('\n');

            const bookContent = `${bookMetadata}\n${pagesWithKeywords}`;

            const newBook = new BookItem({
                id: bookId,
                accessByTab: true,
                parsed: await parseBookFromContent(bookContent),
            });

            items[newBook.id] = newBook;

            //console.debug(`New book created: ${newBook.id}`, newBook);

        } else {
            //console.log("Keywords not found for task", taskId);
        }
    } catch (error) {
        //console.error("Error:", error);
    }
}

async function showkeywordsbook(event, itemID) {
    // console.debug("showKeywordsBook is called");
    // console.debug(itemID);
    await Views.READ_BOOK.show(event, itemID);
}

async function deleteBookById(bookId) {
    if (items[bookId]) {
        delete items[bookId];
        //console.debug(`Book with ID ${bookId} has been deleted.`);
    } else {
        //console.warn(`Book with ID ${bookId} does not exist.`);
    }
}

window.createBookFromKeywords = createBookFromKeywords;
window.showkeywordsbook = showkeywordsbook;
window.deleteBookById = deleteBookById;