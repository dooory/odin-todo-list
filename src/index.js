import "./style.css";

import TaskInterface from "./interfaces/tasks";
import TagInterface from "./interfaces/tags";
import renderer from "./interfaces/renderer";

import { Dropdown, getDropdowns } from "./components/dropdown";

import { add } from "date-fns";

const filterForm = document.getElementById("filterForm");
const searchBar = document.getElementById("searchTasks");
const tagFilter = document.getElementById("searchTags");
const clearFilterButton = document.getElementById("clearFilter");

const tasksRoot = document.getElementById("tasksRoot");
const addTaskDialog = document.getElementById("addTaskDialog");
const addTaskForm = document.getElementById("addTaskForm");

const createTagDialog = document.getElementById("createTagDialog");
const createTagForm = document.getElementById("createTagForm");

const showAddTaskButton = document.getElementById("addTaskButton");
const submitNewTaskButton = document.getElementById("submitNewTask");
const taskDateInput = document.getElementById("taskDate");
const closeAddTaskButton = document.getElementById("closeAddTaskDialog");

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

function resetForm() {
    const inputs = addTaskForm.querySelectorAll("input, textarea, select");

    inputs.forEach((input) => {
        input.disabled = true;
    });

    resetDropdown();

    addTaskForm.reset();
}

let addTaskDropdown;

function resetDropdown() {
    if (addTaskDropdown) {
        addTaskDropdown.remove();
        addTaskDropdown = null;
    }
}

function closeForm() {
    showAddTaskButton.classList.remove("activated");
    addTaskDialog.classList.remove("activated");
}

function showForm() {
    addTaskDropdown = new Dropdown({
        events: {
            onCreateEntryClick: () => createTagDialog.showModal(),
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

    if (!tasksRoot.contains(target) && !createTagDialog.contains(target)) {
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

createTagDialog.addEventListener("close", () => {
    createTagForm.reset();
});

createTagForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(createTagForm);

    const newTagTitle = formData.get("new-tag-title");
    const newTag = TagInterface.createTag(newTagTitle);

    // Select the new tag in every open tag dropdown
    const dropdowns = getDropdowns();

    for (const id in dropdowns) {
        const dropdown = dropdowns[id];

        if (dropdown.isOpen && dropdown.type === "tag") {
            let newTagEntry = dropdown.currentEntries.find(
                (entry) => entry.id === newTag.id,
            );

            if (newTagEntry) {
                newTagEntry.select();
            }
        }
    }

    createTagForm.reset();
    createTagDialog.close();
});

taskDateInput.addEventListener("click", () => {
    taskDateInput.showPicker();
});

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
