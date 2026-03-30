import "./style.css";

import TaskInterface from "./interfaces/tasks";
import TagInterface from "./interfaces/tags";
import renderer from "./interfaces/renderer";

import {
    Dropdown,
    refreshAllDropdowns,
    getDropdowns,
} from "./components/dropdown";

import { add } from "date-fns";

const taskGroups = document.getElementById("task-groups");
const addTaskDialog = document.getElementById("add-task-dialog");
const addTaskForm = document.getElementById("addTaskForm");

const createTagDialog = document.getElementById("createTagDialog");
const createTagForm = document.getElementById("createTagForm");

const showAddTaskButton = document.getElementById("add-task-button");
const submitNewTaskButton = document.getElementById("submitNewTask");
const taskDateInput = document.getElementById("taskDate");

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

submitNewTaskButton.addEventListener("click", () => {
    if (addTaskForm.checkValidity()) {
        submitNewTask();

        showAddTaskButton.classList.remove("activated");
        addTaskDialog.classList.remove("activated");

        resetForm();
    }
});

showAddTaskButton.addEventListener("click", showForm);

document.addEventListener("click", (event) => {
    const target = event.target;

    if (
        target.classList.contains("delete-button") ||
        target.classList.contains("selected-entry")
    ) {
        return;
    }

    if (!taskGroups.contains(target) && !createTagDialog.contains(target)) {
        if (
            target.classList.contains("x-element") ||
            target.classList.contains("selected-tag")
        ) {
            return;
        }

        showAddTaskButton.classList.remove("activated");
        addTaskDialog.classList.remove("activated");

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

    refreshAllDropdowns();

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
