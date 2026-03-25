import TaskInterface from "./interfaces/tasks";
import TagInterface from "./interfaces/tags";
import "./style.css";
import renderer from "./interfaces/renderer";
import { add } from "date-fns";

if (localStorage.getItem("tags")) {
    TagInterface.loadSavedTags();
} else {
    TagInterface.createTag("Example Tag");
}

if (localStorage.getItem("tasks")) {
    TaskInterface.loadSavedTasks();
} else {
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

TagInterface.saveTags();
TaskInterface.saveTasks();

renderer.createAllTaskElements();

const taskGroups = document.getElementById("task-groups");
const addTaskDialog = document.getElementById("add-task-dialog");

const dropdownContainer = document.getElementById("tagsDropdown");
const tagsDropdown = document.getElementById("dropdown");
const selectedItems = document.getElementById("selectedItems");

const createTagDialog = document.getElementById("createTagDialog");
const createTagForm = document.getElementById("createTagForm");
const submitTagButton = document.getElementById("submitTagButton");

createTagDialog.addEventListener("close", (event) => {
    createTagForm.reset();
});

createTagForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(createTagForm);

    const newTagTitle = formData.get("new-tag-title");

    const newTag = TagInterface.createTag(newTagTitle);

    if (dropdownContainer.classList.contains("active")) {
        selectedTags.add(newTag.id);

        const tag = document.createElement("span");
        tag.textContent = `${newTagTitle} `;
        tag.classList.add("selected-tag");
        const xElement = document.createElement("i");
        xElement.textContent = "x";
        xElement.dataset.remove = newTag.id;
        xElement.classList.add("x-element");

        tag.appendChild(xElement);
        selectedItems.appendChild(tag);

        let dropdownEntry = createDropdownEntry(newTag);
        dropdownEntry.classList.add("tagged");
    }

    const openTaskTagDropdowns = taskGroups.querySelectorAll(
        ".task .dropdown.activated",
    );

    openTaskTagDropdowns.forEach((dropdown) => {
        let dropdownEntry = document.createElement("div");
        dropdownEntry.classList.add("dropdown-entry");
        dropdownEntry.dataset.id = newTag.id;
        dropdownEntry.textContent = newTag.title;
        dropdownEntry.classList.add("tagged");

        dropdown.insertBefore(dropdownEntry, dropdown.lastElementChild);
        dropdownEntry.click();
    });

    createTagForm.reset();
    createTagDialog.close();
});

let selectedTags = new Set();

dropdownContainer.addEventListener("click", (e) => {
    // Prevent dropdown from closing when clicking create tag option
    if (e.target.parentElement === tagsDropdown && !e.target.dataset.id) {
        return;
    }

    if (createTagDialog.contains(e.target)) {
        return;
    }

    dropdownContainer.classList.toggle("active");
});

tagsDropdown.addEventListener("click", (e) => {
    const target = e.target;

    const value = target.getAttribute("data-id");
    const label = e.target.textContent;

    if (!selectedTags.has(value) && target.dataset.id) {
        target.classList.add("tagged");

        selectedTags.add(value);

        const tag = document.createElement("span");
        tag.textContent = `${label} `;
        tag.classList.add("selected-tag");
        const xElement = document.createElement("i");
        xElement.textContent = "x";
        xElement.dataset.remove = value;
        xElement.classList.add("x-element");

        tag.appendChild(xElement);
        selectedItems.appendChild(tag);
    } else if (target.id === "openCreateTagButton") {
        createTagDialog.showModal();
    }
});

selectedItems.addEventListener("click", (e) => {
    if (e.target.dataset.remove) {
        const valueToRemove = e.target.dataset.remove;
        selectedTags.delete(valueToRemove);
        e.target.parentElement.remove();

        let dropdownEntry = tagsDropdown.querySelector([
            `.tagged[data-id='${valueToRemove}']`,
        ]);
        dropdownEntry.classList.remove("tagged");
    }
});

const addTaskForm = document.getElementById("addTaskForm");
const showAddTaskButton = document.getElementById("add-task-button");
const submitNewTaskButton = document.getElementById("submitNewTask");
const taskDateInput = document.getElementById("taskDate");

taskDateInput.addEventListener("click", (e) => {
    taskDateInput.showPicker();
});

function resetDropdown() {
    selectedTags.clear();
    selectedItems.innerHTML = "";
    tagsDropdown.innerHTML =
        "<div id='openCreateTagButton'>Create Tag...</div>";
}

function resetForm() {
    const inputs = addTaskForm.querySelectorAll("input, textarea, select");

    inputs.forEach((input) => {
        input.disabled = true;
    });

    resetDropdown();

    addTaskForm.reset();
}

function createDropdownEntry(tag) {
    const tagDiv = document.createElement("div");
    tagDiv.dataset.value = tag.title.toLowerCase();
    tagDiv.dataset.id = tag.id;
    tagDiv.textContent = tag.title;

    tagsDropdown.insertBefore(tagDiv, tagsDropdown.lastElementChild);

    return tagDiv;
}

function showForm() {
    TagInterface.tags.forEach((tag) => {
        createDropdownEntry(tag);
    });

    showAddTaskButton.classList.add("activated");
    addTaskDialog.classList.add("activated");

    const inputs = addTaskForm.querySelectorAll("input, textarea, select");

    inputs.forEach((input) => {
        input.disabled = false;
    });
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

    selectedTags.forEach((id) => {
        task.addTag(id);
    });

    renderer.createTaskElementInDom(task);
}

submitNewTaskButton.addEventListener("click", (e) => {
    if (addTaskForm.checkValidity()) {
        submitNewTask();

        showAddTaskButton.classList.remove("activated");
        addTaskDialog.classList.remove("activated");

        resetForm();
    }
});

showAddTaskButton.addEventListener("click", showForm);

document.addEventListener("click", (e) => {
    if (
        !dropdownContainer.contains(e.target) &&
        !createTagDialog.contains(e.target)
    ) {
        dropdownContainer.classList.remove("active");
    }

    if (!taskGroups.contains(e.target) && !createTagDialog.contains(e.target)) {
        if (
            e.target.classList.contains("x-element") ||
            e.target.classList.contains("selected-tag")
        ) {
            return;
        }
        showAddTaskButton.classList.remove("activated");
        addTaskDialog.classList.remove("activated");

        resetDropdown();
    }
});
