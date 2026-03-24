import renderer from "./renderer";

const maxPriority = 3;

class Task {
    #properties;
    constructor(id, title, description, dueDate, priority, state) {
        this.#properties = {
            id,
            title,
            description,
            dueDate,
            priority,
            state: state ? state : "ongoing",
            tags: [],
        };

        if (state) {
            this.#setState(state);
        }
    }

    set title(newTitle) {
        this.#properties.title = newTitle;
    }

    get title() {
        return this.#properties.title;
    }

    get id() {
        return this.#properties.id;
    }

    set description(newDescription) {
        this.#properties.description = newDescription;
    }

    get description() {
        return this.#properties.description;
    }

    set priority(newPriority) {
        this.#properties.priority = newPriority;
    }

    get priority() {
        return this.#properties.priority;
    }

    set dueDate(newDate) {
        this.#properties.dueDate = newDate;
    }

    get dueDate() {
        return this.#properties.dueDate;
    }

    isDue() {
        return this.#properties.dueDate < new Date();
    }

    get state() {
        return this.#properties.state;
    }

    #setState(newState) {
        this.#properties.state = newState;

        return this.#properties.state;
    }

    complete() {
        if (this.#properties.state === "completed") {
            throw new Error(
                `Error For Task <${this.#properties.title}>: Already marked as completed`,
            );
        }

        this.#setState("completed");
    }

    uncomplete() {
        if (this.#properties.state !== "completed") {
            throw new Error(
                `Error For Task <${this.#properties.title}>: Task State isn't completed`,
            );
        }

        const currentTime = new Date();

        if (currentTime > this.#properties.dueDate) {
            this.#setState("due");
        } else {
            this.#setState("ongoing");
        }
    }

    markAsDue() {
        this.#setState("due");
    }

    get tags() {
        return this.#properties.tags;
    }

    addTag(tag) {
        if (this.#properties.tags[tag.id]) {
            throw new Error(
                `Error for Task <${this.#properties.title}>, task already has tag with id <${tag.id}>`,
            );
        }

        this.#properties.tags[tag.id] = tag;
        tag.addTask(this);
    }

    removeTag(tag) {
        if (!this.#properties.tags[tag.id]) {
            throw new Error(
                `Error for Task <${this.#properties.title}>, task does not have tag with id <${tag.id}>`,
            );
        }

        delete this.#properties.tags[tag.id];
        tag.removeTask(this.#properties.id);
    }
}

class TaskInterface {
    #tasks = {};

    constructor() {}

    createTask(title, description, dueDate, priority, state) {
        const id = crypto.randomUUID();
        let task = new Task(id, title, description, dueDate, priority, state);

        this.#tasks[id] = task;

        return task;
    }

    deleteTask(id) {
        if (!this.#tasks[id]) {
            throw new Error(
                `Error when attempting to delete task with id <${id}>, unable to find such task`,
            );
        }

        const tags = this.#tasks[id].tags;

        for (const tagId in tags) {
            let tag = tags[tagId];

            tag.removeTask(id);
        }

        delete this.#tasks[id];
    }

    duplicateTask(id) {
        const originalTask = this.#tasks[id];

        if (!this.#tasks[id]) {
            throw new Error(
                `Error when attempting to duplicate task with id <${id}>, unable to find such task`,
            );
        }

        let dupeTask = this.createTask(
            originalTask.title,
            originalTask.description,
            originalTask.dueDate,
            originalTask.priority,
            originalTask.state,
        );

        for (const tagId in originalTask.tags) {
            const tag = originalTask.tags[tagId];

            dupeTask.addTag(tag);
        }

        return dupeTask;
    }

    getTasks() {
        return this.#tasks;
    }
}

export default new TaskInterface();
