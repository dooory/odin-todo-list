import TagInterface from "./tags";
import TaskInterface from "./tasks";
import { formatDistanceToNow } from "date-fns";

const tasksParent = document.getElementById("todo-list");

class Renderer {
    #taskElements = [];
    #tagElements = [];

    constructor() {}

    #createTaskDiv(task) {
        let div = document.createElement("div");
        div.classList.add("task");

        let title = document.createElement("h2");
        title.textContent = task.title;
        title.classList.add("task-title");

        let description = document.createElement("p");
        description.textContent = task.description;
        description.classList.add("task-description");

        let dueTime = document.createElement("p");
        dueTime.textContent = formatDistanceToNow(task.dueDate);
        dueTime.classList.add("task-duedate");

        let tags = document.createElement("div");
        tags.classList.add("task-tags");

        for (const id in task.tags) {
            const tag = task.tags[id];

            let tagDiv = document.createElement("div");
            tagDiv.textContent = tag.title;
            tagDiv.classList.add("task-tag");

            tags.appendChild(tagDiv);
        }

        div.appendChild(title);
        div.appendChild(description);
        div.appendChild(dueTime);
        div.appendChild(tags);

        tasksParent.appendChild(div);
    }

    #clearScreen() {
        tasksParent.textContent = "";
    }

    updateScreen() {
        this.#clearScreen();

        const tasks = TaskInterface.getTasks();
        const tags = TagInterface.tags;

        for (const id in tasks) {
            this.#createTaskDiv(tasks[id]);
        }
    }
}

export default new Renderer();
