import TagInterface from "./tags";
import TaskInterface from "./tasks";
import { formatDistanceToNow } from "date-fns";

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

    const editTaskContainer = document.createElement("div");
    editTaskContainer.classList.add("edit-task");
    top.appendChild(editTaskContainer);

    const editTaskButton = document.createElement("button");
    editTaskButton.classList.add("edit-button");
    editTaskButton.type = "button";
    editTaskButton.textContent = "Edit";
    editTaskContainer.appendChild(editTaskButton);

    const bottom = document.createElement("div");
    bottom.classList.add("bottom");
    body.appendChild(bottom);

    const dueDate = document.createElement("div");
    dueDate.classList.add("due-date");
    dueDate.textContent = formatDistanceToNow(task.dueDate);
    bottom.appendChild(dueDate);

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
