import TagInterface from "./tags";
import TaskInterface from "./tasks";
import { formatDate } from "date-fns";
import { Dropdown, refreshAllDropdownsOfType } from "../components/dropdown";

const allTasksContainer = document.getElementById("all-tasks");
const createTagDialog = document.getElementById("createTagDialog");
const addTaskDialog = document.getElementById("add-task-dialog");

function deleteTaskElement(task) {
    const taskElement = getTaskElement(task);

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

    const bottom = taskContainer.querySelector(".bottom");

    const editingDate = taskContainer.querySelector(".edit-due-date");
    editingDate.valueAsDate = task.dueDate;

    const taskTagDropdown = new Dropdown({
        events: {
            onEntryClick: (clickedEntry, isEntrySelected) => {
                if (!isEntrySelected) {
                    task.removeTag(clickedEntry.id, true);
                } else {
                    task.addTag(clickedEntry.id);
                }
            },

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
        isEntrySelected: (entry) => {
            return task.tags.indexOf(entry.id);
        },

        type: "tag",
        updateOnCreate: true,
        selectedEntriesPlaceholder: "No tags...",
        removeSelectedOnClick: false,
        ignoredElements: [addTaskDialog],
    });

    bottom.appendChild(taskTagDropdown.container);

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

export default {
    createTaskElementInDom,
    createAllTaskElements,
};
