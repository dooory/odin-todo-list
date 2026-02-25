class Tag {
    #title;
    #tasks = [];
    #id;

    constructor(id, title, tasks) {
        this.#title = title;
        this.#id = id;

        if (tasks) {
            for (let index = 0; index < tasks.length; index++) {
                const task = tasks[index];

                this.addTask(task);
            }
        }
    }

    get id() {
        return this.#id;
    }

    get tasks() {
        return this.#tasks;
    }

    get title() {
        return this.#title;
    }

    set title(newTitle) {
        this.#title = newTitle;
    }

    addTask(task) {
        this.#tasks[task.id] = task;
    }

    removeTask(taskId) {
        if (!this.#tasks[taskId]) {
            throw new Error(
                `Error for Tag <${this.#title}>, tag does not have task with id <${taskId}>`,
            );
        }

        delete this.#tasks[taskId];
    }

    removeAllTasks() {
        for (const id in this.#tasks) {
            const task = this.#tasks[id];

            task.removeTag(this.#id);
        }
    }
}

class TagInterface {
    #tags;

    constructor() {
        this.#tags = {};
    }

    createTag(title, tasks) {
        const id = crypto.randomUUID();

        const newTag = new Tag(id, title, tasks);

        this.#tags[id] = newTag;

        return newTag;
    }

    deleteTag(tagId) {
        const tag = this.#tags[tagId];

        tag.removeAllTasks();

        delete this.#tags[tagId];
    }

    getTagById(taskId) {
        return this.#tags[taskId];
    }

    get tags() {
        return this.#tags;
    }
}

export default new TagInterface();
