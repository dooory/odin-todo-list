const dropdownTemplate = document.getElementById("dropdownTemplate");
const entryTemplate = document.getElementById("entryTemplate");
const selectedEntryTemplate = document.getElementById("selectedEntryTemplate");

let dropdowns = {};

// Prevent highlighting dropdown text when double/triple clicking them
document.addEventListener("mousedown", (event) => {
    if (event.detail <= 1) {
        return;
    }

    const target = event.target;

    for (const id in dropdowns) {
        const dropdown = dropdowns[id];

        if (!dropdown.container.contains(target)) {
            return;
        }

        event.preventDefault();
    }
});

document.addEventListener("click", (event) => {
    const target = event.target;

    for (const id in dropdowns) {
        const dropdown = dropdowns[id];

        if (!dropdown.isOpen) {
            return;
        }

        if (dropdown.container.contains(target)) {
            return;
        }

        const isIgnoredElement = dropdown.ignoredElements.find((element) =>
            element.contains(target),
        );

        if (isIgnoredElement) {
            return;
        }

        dropdown.close(event);
    }
});

class Dropdown {
    toggle(event) {
        const isOpen = !this.container.classList.contains("activated");

        this.isOpen = isOpen;

        if (isOpen) {
            this.open();
        } else {
            this.close();
        }
    }

    close(event) {
        this.container.classList.remove("activated");

        if (this.events.onClose) {
            this.events.onClose(event);
        }
    }

    open(event) {
        this.container.classList.add("activated");

        if (this.events.onOpen) {
            this.events.onOpen(event);
        }
    }

    remove() {
        this.container.remove();
        delete dropdowns[this.id];
    }

    updateEntries() {
        this.currentEntries = [];

        const currentEntryElements = this.entriesContainer.querySelectorAll(
            ".entry:not(.create-tag-entry)",
        );

        currentEntryElements.forEach((element) => {
            element.remove();
        });

        const entryData = this.getEntryData();

        entryData.forEach((item) => {
            const entryClone = document.importNode(entryTemplate.content, true);

            const entryContainer = entryClone.querySelector(".entry");
            const entryTitle = entryContainer.querySelector(".title");

            entryTitle.textContent = item.title;
            entryContainer.dataset.id = item.id;

            this.entriesContainer.insertBefore(
                entryContainer,
                this.entriesContainer.lastElementChild,
            );

            let entry = {
                title: item.title,
                id: item.id,
                elements: {
                    container: entryContainer,
                    title: entryTitle,
                    selectedEntrySpan:
                        this.selectedEntriesContainer.querySelector(
                            `.selected-entry[data-id='${item.id}']`,
                        ),
                },
                select: () => {
                    entryContainer.click();
                },
            };

            this.currentEntries.push(entry);

            if (!this.isEntrySelected) {
                return;
            }

            if (this.isEntrySelected(entry) > -1) {
                this.#toggleEntrySelection(entry, true);
            }
        });
    }

    #toggleEntrySelection(entry, isSelected) {
        if (isSelected === false || this.selectedEntries.has(entry.id)) {
            entry.elements.container.classList.remove("tagged");
            entry.elements.selectedEntrySpan.remove();

            this.selectedEntries.delete(entry.id);
        } else if (isSelected === true || !this.selectedEntries.has(entry.id)) {
            if (this.selectedEntries.size <= 0) {
                this.selectedEntriesContainer.textContent = "";
            }

            this.selectedEntries.add(entry.id);

            entry.elements.container.classList.add("tagged");

            const selectedEntryClone = document.importNode(
                selectedEntryTemplate.content,
                true,
            );

            const selectedEntrySpan =
                selectedEntryClone.querySelector(".selected-entry");

            selectedEntrySpan.textContent = entry.title;
            selectedEntrySpan.dataset.id = entry.id;
            entry.elements.selectedEntrySpan = selectedEntrySpan;

            this.selectedEntriesContainer.appendChild(selectedEntrySpan);
        }

        if (this.selectedEntriesPlaceholder && this.selectedEntries.size <= 0) {
            let placeholderSpan = document.createElement("span");
            placeholderSpan.classList.add("placeholder");
            placeholderSpan.textContent = this.selectedEntriesPlaceholder;

            this.selectedEntriesContainer.appendChild(placeholderSpan);
        }

        return this.selectedEntries.has(entry.id);
    }

    constructor(options) {
        options = options || {
            events: {},
        };

        const templateClone = document.importNode(
            dropdownTemplate.content,
            true,
        );

        this.id = crypto.randomUUID();
        this.isOpen = false;
        this.selectedEntries = new Set();
        this.currentEntries = [];

        this.container = templateClone.querySelector(".dropdown-container");
        this.entriesContainer = this.container.querySelector(".dropdown");
        this.selectedEntriesContainer =
            this.container.querySelector(".selected-entries");

        this.type = options.type;
        this.ignoredElements = options.ignoredElements || [];
        this.events = options.events || {};
        this.getEntryData = options.getEntryData;
        this.selectedEntriesPlaceholder = options.selectedEntriesPlaceholder;
        this.removeSelectedOnClick =
            options.removeSelectedOnClick === false
                ? options.removeSelectedOnClick
                : true;
        this.isEntrySelected = options.isEntrySelected;

        dropdowns[this.id] = this;

        if (this.selectedEntriesPlaceholder && this.selectedEntries.size <= 0) {
            let placeholderSpan = document.createElement("span");
            placeholderSpan.classList.add("placeholder");
            placeholderSpan.textContent = this.selectedEntriesPlaceholder;

            this.selectedEntriesContainer.appendChild(placeholderSpan);
        }

        if (options.updateOnCreate) {
            this.updateEntries();
        }

        this.container.addEventListener("click", (event) => {
            const target = event.target;

            if (this.events.onClick) {
                this.events.onClick(event);
            }

            if (target.classList.contains("create-tag-entry")) {
                if (this.events.onCreateEntryClick) {
                    this.events.onCreateEntryClick(event);
                }

                return;
            }

            if (
                target !== this.entriesContainer &&
                this.entriesContainer.contains(target) &&
                !target.classList.contains("placeholder")
            ) {
                const clickedEntry = this.currentEntries.find((entry) =>
                    entry.elements.container.contains(target),
                );

                const isEntrySelected =
                    this.#toggleEntrySelection(clickedEntry);

                if (this.events.onEntryClick) {
                    this.events.onEntryClick(clickedEntry, isEntrySelected);

                    return;
                }
            }

            if (
                target !== this.selectedEntriesContainer &&
                this.selectedEntriesContainer.contains(target) &&
                !target.classList.contains("placeholder")
            ) {
                if (!this.removeSelectedOnClick) {
                    this.toggle(event);

                    return;
                }

                const clickedEntry = this.currentEntries.find(
                    (entry) => entry.id === target.dataset.id,
                );

                this.#toggleEntrySelection(clickedEntry);

                return;
            }

            this.toggle(event);
        });
    }
}

function refreshAllDropdowns() {
    for (const id in dropdowns) {
        const dropdown = dropdowns[id];

        dropdown.updateEntries();
    }
}

function getDropdowns() {
    return dropdowns;
}

export { Dropdown, refreshAllDropdowns, getDropdowns };
