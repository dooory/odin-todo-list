import TagInterface from "./tags";
import TaskInterface from "./tasks";
import { formatDate } from "date-fns";

const tasksParent = document.getElementById("all-tasks");

let currentTagFilter = [];

function createTaskElement(task) {
    const taskTemplate = document.getElementById("task-template");

    let taskContainer = document.importNode(taskTemplate.content, true);

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

    const tagsContainer = taskContainer.querySelector(".tags-container");

    for (const tagId in task.tags) {
        if (!Object.hasOwn(task.tags, tagId)) continue;

        const tag = task.tags[tagId];

        const tagTemplate = document.getElementById("task-tag-template");
        const tagContainer = tagTemplate.content.cloneNode(true);
        const tagTitle = tagContainer.querySelector(".tag");
        tagTitle.textContent = tag.title + ",";
        tagTitle.dataset.title = tag.title;

        tagsContainer.appendChild(tagContainer);
    }

    // Remove "," from last tag element
    if (tagsContainer.lastElementChild) {
        tagsContainer.lastElementChild.textContent =
            tagsContainer.lastElementChild.dataset.title;
    }

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
    });

    const cancelButton = taskContainer.querySelector(".cancel-button");

    cancelButton.addEventListener("click", () => {
        body.querySelectorAll("div, input, button").forEach((element) => {
            element.classList.remove("activated");
        });

        editingTitle.value = task.title;
        editingDate.valueAsDate = task.dueDate;
    });

    tasksParent.appendChild(taskContainer);
}

class Renderer {
    constructor() {}

    updateScreen() {
        tasksParent.innerHTML = "";

        const title = document.createElement("h3");
        title.textContent = "Tasks";
        tasksParent.appendChild(title);

        const tasks = TaskInterface.getTasks();

        for (const taskId in tasks) {
            if (!Object.hasOwn(tasks, taskId)) continue;

            const task = tasks[taskId];

            createTaskElement(task);
        }
    }
}

export default new Renderer();
