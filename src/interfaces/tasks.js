const maxPriority = 3;

class Task {
    #title;
    #id;
    #description;
    #priority;
    #dueDate;

    constructor(id, title, description, dueDate, priority) {
        if (priority > maxPriority) {
            throw new Error(`Max priority for tasks is ${maxPriority}`);
        }

        if (dueDate < new Date()) {
            throw new Error("Due date must be in future");
        }

        this.#title = title;
        this.#description = description;
        this.#id = id;
        this.#priority = priority;
        this.#dueDate = dueDate;
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
        if (newPriority > maxPriority) {
            throw new Error(`Max priority for tasks is ${maxPriority}`);
        }

        this.#priority = newPriority;
    }

    get priority() {
        return this.#priority;
    }

    set dueDate(newDate) {
        if (newDate < new Date()) {
            throw new Error("Due date must be in future");
        }

        this.#dueDate = newDate;
    }

    get dueDate() {
        return this.#dueDate;
    }
}

class TaskInterface {
    #tasks = {};

    constructor() {}

    createTask(title, description, dueDate, priority) {
        const id = crypto.randomUUID();
        let task = new Task(id, title, description, dueDate, priority);

        this.#tasks[id] = task;

        return task;
    }

    getTasks() {
        return this.#tasks;
    }
}

export default new TaskInterface();
