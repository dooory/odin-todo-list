import TagInterface from "./tags";
import TaskInterface from "./tasks";
import { formatDate } from "date-fns";

const tasksParent = document.getElementById("all-tasks");

let currentTagFilter = [];

function createTaskElement(task) {
    const container = document.createElement("div");
    container.classList.add("task");
    tasksParent.appendChild(container);

    const stateContainer = document.createElement("div");
    stateContainer.classList.add("state");
    container.appendChild(stateContainer);

    const stateCheckbox = document.createElement("input");
    stateCheckbox.type = "checkbox";
    stateCheckbox.name = "task-checkbox";
    stateCheckbox.classList.add("task-checkbox");
    stateCheckbox.checked = task.state === "completed" ? true : false;
    stateContainer.appendChild(stateCheckbox);

    const body = document.createElement("div");
    body.classList.add("body");
    container.appendChild(body);

    const top = document.createElement("div");
    top.classList.add("top");
    body.appendChild(top);

    const title = document.createElement("div");
    title.classList.add("title");
    title.textContent = task.title;
    top.appendChild(title);

    const editTitle = document.createElement("input");
    editTitle.type = "text";
    editTitle.value = task.title;
    editTitle.name = "edit-task-title";
    editTitle.classList.add("edit-task-title");
    editTitle.dataset.property = "title";
    top.appendChild(editTitle);

    const editTaskContainer = document.createElement("div");
    editTaskContainer.classList.add("edit-task");
    top.appendChild(editTaskContainer);

    const saveButton = document.createElement("button");
    saveButton.classList.add("save-button");
    saveButton.type = "button";
    saveButton.textContent = "Save";
    editTaskContainer.appendChild(saveButton);

    const bottom = document.createElement("div");
    bottom.classList.add("bottom");
    body.appendChild(bottom);

    const dueDate = document.createElement("div");
    dueDate.classList.add("due-date");
    dueDate.textContent = formatDate(task.dueDate, "dd-MM-yyyy");
    bottom.appendChild(dueDate);

    const editDueDate = document.createElement("input");
    editDueDate.classList.add("edit-due-date");
    editDueDate.name = "edit-due-date";
    editDueDate.type = "date";
    editDueDate.valueAsDate = task.dueDate;
    editDueDate.dataset.property = "dueDate";
    bottom.appendChild(editDueDate);

    const tags = document.createElement("div");
    tags.classList.add("tags");
    bottom.appendChild(tags);

    for (const tagId in task.tags) {
        if (!Object.hasOwn(task.tags, tagId)) continue;

        const tag = task.tags[tagId];

        const tagElement = document.createElement("span");
        tagElement.textContent = tag.title;
        tags.appendChild(tagElement);
    }

    const divider = document.createElement("hr");
    tasksParent.appendChild(divider);

    title.addEventListener("click", () => {
        if (!title.classList.contains("activated")) {
            title.classList.add("activated");
            editTitle.classList.add("activated");
            saveButton.classList.add("activated");
            editTitle.focus();
        }
    });

    dueDate.addEventListener("click", () => {
        if (!dueDate.classList.contains("activated")) {
            dueDate.classList.add("activated");
            editDueDate.classList.add("activated");
            saveButton.classList.add("activated");
            editDueDate.focus();
        }
    });

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
