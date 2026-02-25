import TagInterface from "./tags";
import TaskInterface from "./tasks";
import { formatDistanceToNow } from "date-fns";

const tasksParent = document.getElementById("todo-list");
const tagsParent = document.getElementById("filter-by-tag");

let currentTagFilter = [];

class Renderer {
    constructor() {}

    #createTaskDiv(task) {
        let div = document.createElement("div");
        div.dataset.taskId = task.id;
        div.classList.add("task", `prio-${task.priority}`);

        if (task.isDue()) {
            div.classList.add("due-task");
        }

        let top = document.createElement("div");

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

        let editButton = document.createElement("button");
        editButton.classList.add("edit-task");
        editButton.textContent = "Edit";

        top.appendChild(title);
        top.appendChild(editButton);

        div.appendChild(top);
        div.appendChild(description);
        div.appendChild(dueTime);
        div.appendChild(tags);

        tasksParent.appendChild(div);
    }

    #createTagFilter(tag) {
        let containerDiv = document.createElement("div");
        containerDiv.classList.add("tag-filter");
        containerDiv.dataset.tagTitle = tag.title;

        if (currentTagFilter.includes(tag.id)) {
            containerDiv.classList.add("activated");
        }

        let filterButton = document.createElement("button");
        filterButton.textContent = tag.title;
        filterButton.type = "button";
        filterButton.addEventListener("click", () => {
            console.log(`${tag.title}`);

            let tagIndex = currentTagFilter.indexOf(tag.id);

            if (tagIndex >= 0) {
                currentTagFilter.splice(tagIndex, 1);
            } else {
                currentTagFilter.push(tag.id);
            }

            console.log(currentTagFilter);

            this.updateScreen();
        });

        containerDiv.appendChild(filterButton);

        tagsParent.appendChild(containerDiv);
    }

    #clearScreen() {
        tasksParent.textContent = "";
        tagsParent.textContent = "";
    }

    updateScreen() {
        this.#clearScreen();

        const tasks = TaskInterface.getTasks();

        for (const id in tasks) {
            const task = tasks[id];

            let isTaskFiltered;

            if (currentTagFilter.length > 0) {
                for (const index in currentTagFilter) {
                    const tagId = currentTagFilter[index];

                    if (!task.tags[tagId]) {
                        isTaskFiltered = true;

                        break;
                    } else {
                        isTaskFiltered = false;
                    }
                }
            } else {
                isTaskFiltered = false;
            }

            if (!isTaskFiltered) {
                this.#createTaskDiv(task);
            }
        }

        const tags = TagInterface.tags;

        for (const id in tags) {
            this.#createTagFilter(tags[id]);
        }
    }
}

export default new Renderer();
