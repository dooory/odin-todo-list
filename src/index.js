import TaskInterface from "./interfaces/tasks";
import TagInterface from "./interfaces/tags";
import "./style.css";
import renderer from "./interfaces/renderer";
import { format } from "date-fns";

let myTag = TagInterface.createTag("Work");

renderer.updateScreen();

const taskGroups = document.getElementById("task-groups");
const addTaskDialog = document.getElementById("add-task-dialog");

const dropdownContainer = document.getElementById("tagsDropdown");
const tagsDropdown = document.getElementById("dropdown");
const selectedItems = document.getElementById("selectedItems");

let selectedTags = new Set();

dropdownContainer.addEventListener("click", (e) => {
    dropdownContainer.classList.toggle("active");
});

tagsDropdown.addEventListener("click", (e) => {
    const target = e.target;

    if (target.classList.contains("dropdown")) {
        return;
    }

    const value = target.getAttribute("data-id");
    const label = e.target.textContent;

    if (!selectedTags.has(value)) {
        selectedTags.add(value);

        const tag = document.createElement("span");
        tag.textContent = `${label} `;
        const xElement = document.createElement("i");
        xElement.textContent = "x";
        xElement.dataset.remove = value;

        tag.appendChild(xElement);
        selectedItems.appendChild(tag);
    }
});

selectedItems.addEventListener("click", (e) => {
    if (e.target.dataset.remove) {
        const valueToRemove = e.target.dataset.remove;
        selectedTags.delete(valueToRemove);
        e.target.parentElement.remove();
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
    tagsDropdown.innerHTML = "";
}

function resetForm() {
    const inputs = addTaskForm.querySelectorAll("input, textarea, select");

    inputs.forEach((input) => {
        input.disabled = true;
    });

    resetDropdown();

    addTaskForm.reset();
}

function showForm() {
    Object.entries(TagInterface.tags).forEach(([id, tag]) => {
        const tagDiv = document.createElement("div");
        tagDiv.dataset.value = tag.title.toLowerCase();
        tagDiv.dataset.id = id;
        tagDiv.textContent = tag.title;

        tagsDropdown.appendChild(tagDiv);
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
        dueDate,
        Number(priority),
    );

    selectedTags.forEach((id) => {
        task.addTag(TagInterface.getTagById(id));
    });
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
    if (!dropdownContainer.contains(e.target)) {
        dropdownContainer.classList.remove("active");
    }

    if (!taskGroups.contains(e.target)) {
        showAddTaskButton.classList.remove("activated");
        addTaskDialog.classList.remove("activated");

        resetDropdown();
    }
});
