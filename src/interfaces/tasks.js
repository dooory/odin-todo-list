class Task {
    #title;
    #id;
    #description;
    #priority;

    constructor(id, title, description, priority) {
        this.#title = title;
        this.#description = description;
        this.#id = id;
        this.#priority = priority;
    }

    set title(newTitle) {
        this.#title = newTitle;
    }

    get title() {
        return this.#title;
    }

    set description(newDescription) {
        this.#description = newDescription;
    }

    get description() {
        return this.#description;
    }

    set priority(newPriority) {
        this.#priority = newPriority;
    }

    get priority() {
        return this.#priority;
    }
}

class TaskInterface {
    #tasks = {};

    constructor() {}

    createTask(title, description, priority) {
        const id = crypto.randomUUID();
        let task = new Task(id, title, description, priority);

        this.#tasks[id] = task;
    }

    getTasks() {
        return this.#tasks;
    }
}

export default new TaskInterface();
