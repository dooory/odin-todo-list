class Task {
    #title;
    #id;
    #description;

    constructor(id, title, description) {
        this.#title = title;
        this.#description = description;
        this.#id = id;
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
}

class TaskInterface {
    #tasks = {};

    constructor() {}

    createTask(title, description) {
        const id = crypto.randomUUID();
        let task = new Task(id, title, description);

        this.#tasks[id] = task;
    }

    getTasks() {
        return this.#tasks;
    }
}

export default new TaskInterface();
