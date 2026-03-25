import TaskInterface from "./tasks";

class Tag {
    #properties;

    constructor(id, title) {
        this.#properties = {
            id,
            title,
            tasks: [],
        };
    }

    get id() {
        return this.#properties.id;
    }

    get tasks() {
        return this.#properties.tasks;
    }

    get title() {
        return this.#properties.title;
    }

    set title(newTitle) {
        this.#properties.title = newTitle;
    }

    addTask(taskId) {
        const taskIdIndex = this.#properties.tasks.indexOf(taskId);

        if (taskIdIndex >= 0) {
            throw new Error(
                `Error for tag <${this.#properties.title}>, tag already has task with id <${taskId}>`,
            );
        }

        this.#properties.tasks.push(taskId);
    }

    removeTask(taskId) {
        const taskIdIndex = this.#properties.tasks.indexOf(taskId);

        if (taskIdIndex === -1) {
            throw new Error(
                `Error for Tag <${this.#properties.title}>, tag does not have task with id <${taskId}>`,
            );
        }

        this.#properties.tasks.splice(taskIdIndex, 1);
    }

    removeAllTasks() {
        this.#properties.tasks.forEach((taskId) => {
            const task = TaskInterface.getTaskById(taskId);

            task.removeTag(this.#properties.id, false);
            this.removeTask(taskId);
        });
    }
}

class TagInterface {
    #tags;

    constructor() {
        this.#tags = [];
    }

    createTag(title, tasks) {
        const id = crypto.randomUUID();

        const newTag = new Tag(id, title, tasks);

        this.#tags.push(newTag);

        return newTag;
    }

    deleteTag(tagId) {
        const tagIndex = this.#tags.findIndex((tag) => tag.id === tagId);

        if (tagIndex === -1) {
            throw new Error(
                `Error when attempting to delete tag with id <${tagId}>, unable to find such tag`,
            );
        }

        const tag = this.#tags[tagIndex];

        tag.removeAllTasks();
        this.#tags.splice(tagIndex, 1);
    }

    getTagById(tagId) {
        return this.#tags.find((tag) => tag.id === tagId);
    }

    get tags() {
        return this.#tags;
    }
}

export default new TagInterface();
