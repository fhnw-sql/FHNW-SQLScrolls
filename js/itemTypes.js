class ItemType {
    constructor(options) {
        for (let key of Object.keys(options)) {
            this[key] = options[key];
        }
    }

    render() {
        return '<p>Missing item render() function!</p>'
    }

    renderShowItem() {
        return '<p>Missing item renderShowItem() function!'
    }

    remove() {
    }

    onShow() {
    }
}

class ImageItem extends ItemType {

    /**
     * @param options {id, name, url, onclick, discoverTitle, discoverText, unlocks}
     */
    constructor(options) {
        super({
            name: `i18n-${options.id}-name`,
            onclick: `Views.SHOW_ITEM.show('${options.id}')`,
            discoverTitle: "",
            discoverText: `i18n-${options.id}-hint`,
            alt: "unset image description",
            unlocks: [],
            newItem: true,
            unlocked: true,
            accessByTab: false,
            ...options
        })
    }

    render() {
        return `<button 
                    id="${this.id}"
                    class="item ${this.unlocked ? '' : ' locked'}"
                    onclick="${this.onclick}"
                    type="button" ${this.unlocked ? '' : 'disabled'}
                    ${this.accessByTab ? 'tabindex="0"' : ''}
                >
                    <img class="item-icon" alt="${i18n.get(this.alt)}" src="${this.url}" draggable="false">
                    ${this.newItem ? `<div class="new-item-highlight"><div class="burst-12"> </div></div>` : ''}
                    <p>${i18n.get(this.name)}</p>
                </button>`
    }

    renderShowItem() {
        return `<img class="item-icon" alt="${i18n.get(this.name)}" src="${this.url}" draggable="false">`
    }

    remove() {
        inventory.removeItem(this.id);
    }
}

class BookItem extends ItemType {

    /**
     * @param options {parsed}
     */
    constructor(options) {
        super({
            newItem: true,
            accessByTab: false,
            ...options
        });
        const parsed = options.parsed;
        if (parsed) {
            this.id = parsed.metadata.id;
            this.onclick = `Views.READ_BOOK.show(event, '${this.id}')`;
            this.shortName = parsed.metadata.name;
            this.name = parsed.metadata.title;
            this.author = parsed.metadata.author;
            this.color = parsed.metadata.color;
            this.pages = parsed.pages.length;
            this.discoverText = parsed.cover;
        }
    }

    renderShowItem() {
        return `<div class="book ${this.color}-book">
                    <p class="book-title">${i18n.get(this.name)}</p>
                    <p class="book-author">${i18n.get(this.author)}</p>
                </div>`
    }

    render() {
        return `<button 
                    id="${this.id}"
                    class="item"
                    onclick="${this.onclick}"
                    aria-label="book ${this.shortName}"
                >
                    <div class="item-icon book ${this.color}-book">
                        <p class="book-title">${i18n.get(this.name)}</p>
                        <p class="book-author">${i18n.get(this.author)}</p>
                    </div>
                    ${this.newItem ? `<div class="new-item-highlight"><div class="burst-12"> </div></div>` : ''}
                    <p><i class="fa fa-fw fa-bookmark col-book-${this.color}"></i> ${i18n.get(this.shortName)}</p>
                </button>`;
    }

    renderBook(pageNumber) {
        const firstPage = pageNumber === 0;
        const lastPage = pageNumber + 2 >= this.pages;
        const prev = ` <button id="display-prev-page" class="btn col-white mr-2" onclick="Views.READ_BOOK.previousPage()"
                               ${firstPage ? 'disabled' : ''} style="opacity:${firstPage ? 0 : 1}">
                           <i class="fa fa-reply"></i> ${i18n.get('i18n-previous-page')}
                       </button>`;
        const next = `<button class="btn col-white ml-2" id="display-next-page" onclick="Views.READ_BOOK.nextPage()"
                               ${lastPage ? 'disabled' : ''} style="opacity:${lastPage ? 0 : 1}">
                           ${i18n.get('i18n-next-page')} <i class="fa fa-share"></i>
                       </button>`;
        const close = `<div class="row justify-content-center">
                          <button id="display-close-button" class="btn" data-dismiss="modal">${i18n.get('i18n-close')} &times;</button>
                       </div>`
        const leftPage = this.parsed.pages[pageNumber];
        const rightPage = this.parsed.pages[pageNumber + 1];
        return `<div class="book-open left ${this.color}-book">
                <div class="row">
                    <div class="col page" aria-label="left page"><p>${leftPage ? leftPage : ''}</p>${prev}</div>
                    <div class="col page" aria-label="right page"><p>${rightPage ? rightPage : ' '}</p>${next}${close}</div>
                </div>
            </div>`
    }

    remove() {
        inventory.removeItem(this.id);
    }
}