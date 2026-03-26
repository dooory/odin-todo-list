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
        createDropdownEntry(newTag).click();
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
    renderer.refreshAllTaskElements();

    createTagForm.reset();
    createTagDialog.close();
});

let selectedTags = new Set();

dropdownContainer.addEventListener("click", (e) => {
    // Prevent dropdown from closing when clicking create tag option
    if (e.target.parentElement === tagsDropdown && !e.target.dataset.id) {
        return;
    }

    if (e.target.className === "delete-button") {
        return;
    }

    if (createTagDialog.contains(e.target)) {
        return;
    }

    dropdownContainer.classList.toggle("active");
});

tagsDropdown.addEventListener("click", (e) => {
    const target = e.target;

    if (target.id === "openCreateTagButton") {
        createTagDialog.showModal();
        return;
    }

    const tagDiv =
        target.classList.contains("title") ||
        target.classList.contains("delete-button")
            ? target.parentElement
            : target;
    const tagTitle = target.querySelector(".title");
    const tagId = tagDiv.dataset.id;

    if (target.classList.contains("delete-button")) {
        const selectedTagElement = selectedItems.querySelector(
            `[data-remove='${tagId}']`,
        );

        if (selectedTagElement) {
            selectedTagElement.parentElement.remove();
            selectedTags.delete(tagId);
        }

        TagInterface.deleteTag(tagId);

        renderer.refreshAllTaskElements();

        tagDiv.remove();

        return;
    }

    const label = tagTitle.textContent;

    if (tagId && !selectedTags.has(tagId)) {
        tagDiv.classList.add("tagged");

        selectedTags.add(tagId);

        const tag = document.createElement("span");
        tag.textContent = `${label} `;
        tag.classList.add("selected-tag");
        const xElement = document.createElement("i");
        xElement.textContent = "x";
        xElement.dataset.remove = tagId;
        xElement.classList.add("x-element");

        tag.appendChild(xElement);
        selectedItems.appendChild(tag);
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
        "<div id='openCreateTagButton' class='entry'>Create Tag...</div>";
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
    renderer.createDropdownEntries(tagsDropdown);

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
    if (e.target.classList.contains("delete-button")) {
        return;
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
