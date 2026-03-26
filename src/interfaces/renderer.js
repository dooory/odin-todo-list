import TagInterface from "./tags";
import TaskInterface from "./tasks";
import { formatDate } from "date-fns";

const allTasksContainer = document.getElementById("all-tasks");

let currentTagFilter = [];
let elementControllers = {};

const createTagDialog = document.getElementById("createTagDialog");

function createDropdownEntry(tag) {
    const entryTemplate = document.getElementById("tagDropdownEntry");
    const templateClone = document.importNode(entryTemplate.content, true);

    const entry = templateClone.querySelector(".entry");
    entry.dataset.value = tag.title.toLowerCase();
    entry.dataset.id = tag.id;

    const tagTitle = entry.querySelector(".title");
    tagTitle.textContent = tag.title;

    return entry;
}

function deleteTaskElement(task) {
    const taskElement = getTaskElement(task);

    const controller = elementControllers[task.id];

    controller.abort();
    taskElement.remove();
}

function createTaskElementInDom(task) {
    let newTaskElement = createTaskElement(task);

    allTasksContainer.appendChild(newTaskElement);

    return newTaskElement;
}

function createTaskElement(task) {
    const taskTemplate = document.getElementById("task-template");

    let taskFragment = document.importNode(taskTemplate.content, true);
    let taskElement = taskFragment.querySelector(".task");
    taskElement.dataset.id = task.id;

    let taskContainer = taskFragment.querySelector(".task-container");

    const stateCheckbox = taskContainer.querySelector(".task-checkbox");
    stateCheckbox.checked = task.state === "completed" ? true : false;

    const title = taskContainer.querySelector(".title");
    title.textContent = task.title;

    const editingTitle = taskContainer.querySelector(".edit-task-title");
    editingTitle.value = task.title;

    const dueDate = taskContainer.querySelector(".due-date");
    dueDate.textContent = formatDate(task.dueDate, "dd-MM-yyyy");

    const editingDate = taskContainer.querySelector(".edit-due-date");
    editingDate.valueAsDate = task.dueDate;

    const tagsSection = taskContainer.querySelector(".tags");
    const tagsContainer = tagsSection.querySelector(".tags-container");

    if (Object.entries(task.tags).length <= 0) {
        tagsContainer.textContent = "No tags...";
        tagsContainer.classList.add("no-tags");
    }

    task.tags.forEach((tagId) => {
        let tag = TagInterface.getTagById(tagId);

        const tagTemplate = document.getElementById("task-tag-template");
        const tagContainer = tagTemplate.content.cloneNode(true);
        const tagTitle = tagContainer.querySelector(".tag");
        tagTitle.textContent = tag.title + ",";
        tagTitle.dataset.title = tag.title;

        tagsContainer.appendChild(tagContainer);
    });

    // Remove "," from last tag element
    if (tagsContainer.lastElementChild) {
        tagsContainer.lastElementChild.textContent =
            tagsContainer.lastElementChild.dataset.title;
    }

    // Prevent selecting tag section text when double/triple clicking
    tagsSection.addEventListener(
        "mousedown",
        (event) => {
            if (event.detail > 1) {
                event.preventDefault();
            }
        },
        false,
    );

    const dropdownEntries = taskContainer.querySelector(".dropdown");

    tagsContainer.addEventListener("click", (e) => {
        dropdownEntries.classList.toggle("activated");
    });

    const controller = new AbortController();
    const signal = controller.signal;

    elementControllers[task.id] = controller;

    setTimeout(() => {
        document.addEventListener(
            "click",
            (event) => {
                if (
                    taskContainer.contains(event.target) ||
                    createTagDialog.contains(event.target)
                ) {
                    return;
                }

                dropdownEntries.classList.remove("activated");
            },
            { signal },
        );
    }, 1);

    createTagDropdownEntries(dropdownEntries, task);

    let createTagEntry = document.createElement("div");
    createTagEntry.textContent = "Create Tag...";
    createTagEntry.classList.add("create-tag-entry", "entry");

    dropdownEntries.appendChild(createTagEntry);

    dropdownEntries.addEventListener("click", (e) => {
        const target = e.target;

        if (target === createTagEntry) {
            createTagDialog.showModal();

            return;
        }

        let tagDiv =
            target.classList.contains("title") ||
            target.classList.contains("delete-button")
                ? target.parentElement
                : target;
        const tagId = tagDiv.dataset.id;

        if (target.classList.contains("delete-button")) {
            TagInterface.deleteTag(tagId);

            refreshAllTaskElements(task);

            return;
        }

        const taskHasTag = task.tags.indexOf(tagId) !== -1;

        if (!taskHasTag) {
            task.addTag(tagId);
        } else if (taskHasTag) {
            task.removeTag(tagId, true);
        }

        refreshTaskElement(task);
    });

    title.addEventListener("click", () => {
        if (!title.classList.contains("activated")) {
            title.classList.add("activated");
            editingTitle.classList.add("activated");
            saveButton.classList.add("activated");
            cancelButton.classList.add("activated");
            editingTitle.focus();
        }
    });

    dueDate.addEventListener("click", () => {
        if (!dueDate.classList.contains("activated")) {
            dueDate.classList.add("activated");
            editingDate.classList.add("activated");
            saveButton.classList.add("activated");
            cancelButton.classList.add("activated");
            editingDate.focus();
        }
    });

    const saveButton = taskContainer.querySelector(".save-button");
    const body = taskContainer.querySelector(".body");

    saveButton.addEventListener("click", () => {
        body.querySelectorAll("div, input, button").forEach((element) => {
            element.classList.remove("activated");
        });

        body.querySelectorAll("input[data-property]").forEach((element) => {
            let propName = element.dataset.property;
            let value = element.value;

            if (propName === "dueDate") {
                task.dueDate = new Date(value);
            } else if (propName === "title") {
                task.title = value;
            }
        });

        refreshTaskElement(task);
    });

    const cancelButton = taskContainer.querySelector(".cancel-button");

    cancelButton.addEventListener("click", () => {
        body.querySelectorAll("div, input, button").forEach((element) => {
            element.classList.remove("activated");
        });

        editingTitle.value = task.title;
        editingDate.valueAsDate = task.dueDate;
    });

    const deleteButton = taskContainer.querySelector(".delete-button");

    deleteButton.addEventListener("click", () => {
        deleteTaskElement(task);
        TaskInterface.deleteTask(task.id);
    });

    return taskElement;
}

function createAllTaskElements() {
    clearAllTaskElements();

    TaskInterface.getTasks().forEach((task) => {
        createTaskElementInDom(task);
    });
}

function refreshAllTaskElements() {
    TaskInterface.getTasks().forEach((task) => refreshTaskElement(task));
}

function refreshTaskElement(task) {
    const id = task.id;
    const currentTaskElement = getTaskElement(task);
    const nextTaskElement = currentTaskElement.nextSibling;

    const activatedElements = currentTaskElement.querySelectorAll(".activated");
    const activatedClassNames = [];

    activatedElements.forEach((element) => {
        let classNames = "";

        element.classList.forEach((name) => {
            if (name === "activated") {
                return;
            }

            classNames = `${classNames}.${name}`;
        });

        activatedClassNames.push(classNames);
    });

    const oldInputValues = {
        "edit-task-title":
            currentTaskElement.querySelector(".edit-task-title").value,
        "edit-due-date":
            currentTaskElement.querySelector(".edit-due-date").value,
    };

    deleteTaskElement(task);

    let newTaskElement = createTaskElement(task);

    activatedClassNames.forEach((rule) => {
        const element = newTaskElement.querySelector(rule);

        element.classList.add("activated");
    });

    for (const className in oldInputValues) {
        if (!Object.hasOwn(oldInputValues, className)) continue;

        const element = newTaskElement.querySelector(`.${className}`);

        element.value = oldInputValues[className];
    }

    if (nextTaskElement) {
        allTasksContainer.insertBefore(newTaskElement, nextTaskElement);

        return newTaskElement;
    } else {
        allTasksContainer.appendChild(newTaskElement);

        return newTaskElement;
    }
}

function clearAllTaskElements() {
    allTasksContainer.innerHTML = "<h3>Tasks</h3>";
}

function getTaskElement(task) {
    return allTasksContainer.querySelector(`.task[data-id='${task.id}']`);
}

function createTagDropdownEntries(dropdown, task) {
    TagInterface.tags.forEach((tag) => {
        let entry = createDropdownEntry(tag);

        if (task) {
            const taskHasTag = task.tags.indexOf(tag.id) !== -1;

            if (taskHasTag) {
                entry.classList.add("tagged");
            }
        }

        dropdown.insertBefore(entry, dropdown.lastElementChild);
    });
}

class Renderer {
    constructor() {}

    createTaskElementInDom = createTaskElementInDom;
    createAllTaskElements = createAllTaskElements;
    refreshTaskElement = refreshTaskElement;
    refreshAllTaskElements = refreshAllTaskElements;
    createDropdownEntries = createTagDropdownEntries;
}

export default new Renderer();
