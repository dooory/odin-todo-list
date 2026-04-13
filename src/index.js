import "./style.css";

import TaskInterface from "./interfaces/tasks";
import TagInterface from "./interfaces/tags";
import renderer from "./interfaces/renderer";

import { Dropdown, getDropdowns } from "./components/dropdown";

import { add } from "date-fns";

// Search/Filtering tasks handling
const filterForm = document.getElementById("filterForm");
const searchBar = document.getElementById("searchTasks");
const tagFilter = document.getElementById("searchTags");
const clearFilterButton = document.getElementById("clearFilter");

filterForm.addEventListener("submit", (event) => event.preventDefault());

searchBar.addEventListener("input", (event) => {
    const query = event.target.value;

    renderer.filterTaskElements(query, tagFilter.value);
});

tagFilter.addEventListener("change", (event) => {
    const filterValue = event.target.value;

    renderer.filterTaskElements(searchBar.value, filterValue);
});

clearFilterButton.addEventListener("click", () => {
    searchBar.value = "";
    tagFilter.value = "all";

    renderer.filterTaskElements(searchBar.value, tagFilter.value);
});

// Tags Manager handling
const showTagsManagerButton = document.getElementById("showTagsManager");
const tagsManager = document.getElementById("manageTagsDialog");
const openCreateTagButton = document.querySelector(".create-tag-option");
const createTagForm = document.getElementById("createTagForm");
const createTagTitle = document.getElementById("createTagTitle");
const cancelCreateTagButton = document.getElementById("cancelCreateTagButton");

function toggleCreateTagOption(toggle) {
    if (toggle === true) {
        openCreateTagButton.classList.add("activated");
        createTagForm.classList.add("activated");
        createTagTitle.select();
    } else if (toggle === false) {
        openCreateTagButton.classList.remove("activated");
        createTagForm.classList.remove("activated");
        createTagForm.reset();
    }
}

showTagsManagerButton.addEventListener("click", () => {
    renderer.refreshTagManager();
    tagsManager.showModal();
});

openCreateTagButton.addEventListener("click", () =>
    toggleCreateTagOption(true),
);

cancelCreateTagButton.addEventListener("click", () => {
    toggleCreateTagOption(false);
});

createTagForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const tag = TagInterface.createTag(createTagTitle.value);

    // Select the new tag in every open tag dropdown
    const dropdowns = getDropdowns();

    let hasSelectedTagEntry = false;

    for (const id in dropdowns) {
        const dropdown = dropdowns[id];

        if (dropdown.isOpen && dropdown.type === "tag") {
            let tagEntry = dropdown.currentEntries.find(
                (entry) => entry.id === tag.id,
            );

            if (tagEntry) {
                hasSelectedTagEntry = true;
                tagEntry.select();
            }
        }
    }

    toggleCreateTagOption(false);

    if (hasSelectedTagEntry) {
        tagsManager.close();
    }
});

tagsManager.addEventListener("close", () => {
    toggleCreateTagOption(false);
});

// Create new task form handling

const tasksRoot = document.getElementById("tasksRoot");
const addTaskDialog = document.getElementById("addTaskDialog");
const addTaskForm = document.getElementById("addTaskForm");

const showAddTaskButton = document.getElementById("addTaskButton");
const closeAddTaskButton = document.getElementById("closeAddTaskDialog");

const taskDateInput = document.getElementById("taskDate");
const submitNewTaskButton = document.getElementById("submitNewTask");

let addTaskDropdown;

function showForm() {
    addTaskDropdown = new Dropdown({
        events: {
            onCreateEntryClick: () => {
                tagsManager.showModal();
                toggleCreateTagOption(true);
            },
        },
        getEntryData: () => {
            const currentTags = TagInterface.tags;

            return currentTags.map((tag) => {
                let data = {};

                data.title = tag.title;
                data.id = tag.id;

                return data;
            });
        },
        updateOnCreate: true,
        type: "tag",
        selectedEntriesPlaceholder: "No tags...",
        ignoredElements: [tagsManager],
    });

    addTaskForm.insertBefore(
        addTaskDropdown.container,
        addTaskForm.lastElementChild,
    );

    const inputs = addTaskForm.querySelectorAll("input, textarea, select");

    inputs.forEach((input) => {
        input.disabled = false;
    });

    showAddTaskButton.classList.add("activated");
    addTaskDialog.classList.add("activated");
}

function closeForm() {
    showAddTaskButton.classList.remove("activated");
    addTaskDialog.classList.remove("activated");
}

function resetForm() {
    const inputs = addTaskForm.querySelectorAll("input, textarea, select");

    inputs.forEach((input) => {
        input.disabled = true;
    });

    resetDropdown();

    addTaskForm.reset();
}

function resetDropdown() {
    if (addTaskDropdown) {
        addTaskDropdown.remove();
        addTaskDropdown = null;
    }
}

function submitNewTask() {
    const data = new FormData(addTaskForm);
    const title = data.get("task-title");
    const dueDate = data.get("task-date");
    const priority = data.get("task-priority");

    const task = TaskInterface.createTask(
        title,
        "Description",
        new Date(dueDate),
        Number(priority),
    );

    addTaskDropdown.selectedEntries.forEach((id) => {
        task.addTag(id);
    });

    renderer.createTaskElementInDom(task);
}

submitNewTaskButton.addEventListener("click", () => {
    if (addTaskForm.checkValidity()) {
        submitNewTask();

        closeForm();

        resetForm();
    }
});

showAddTaskButton.addEventListener("click", showForm);

closeAddTaskButton.addEventListener("click", () => {
    closeForm();

    resetForm();
});

document.addEventListener("click", (event) => {
    const target = event.target;

    if (
        target.classList.contains("delete-button") ||
        target.classList.contains("selected-entry")
    ) {
        return;
    }

    if (!tasksRoot.contains(target) && !tagsManager.contains(target)) {
        if (
            target.classList.contains("x-element") ||
            target.classList.contains("selected-tag")
        ) {
            return;
        }

        closeForm();

        resetDropdown();
    }
});

taskDateInput.addEventListener("click", () => {
    taskDateInput.showPicker();
});

// Loading save data and user interface
function loadDefaultTags() {
    TagInterface.createTag("Example Tag");
}

function loadDefaultTasks() {
    let myTask = TaskInterface.createTask(
        "Example task",
        "Example description",
        add(new Date(), {
            days: 1,
        }),
        1,
    );

    myTask.addTag(TagInterface.tags[0].id);
}

function loadUI() {
    renderer.createAllTaskElements();
}

if (localStorage.getItem("tags")) {
    TagInterface.loadSavedTags();
} else {
    loadDefaultTags();
}

if (localStorage.getItem("tasks")) {
    TaskInterface.loadSavedTasks();
} else {
    loadDefaultTasks();
}

loadUI();

renderer.refreshTagManager();
