const maxPriority = 3;

class Task {
    #title;
    #id;
    #description;
    #priority;
    #dueDate;
    #state = "ongoing";

    constructor(id, title, description, dueDate, priority) {
        if (priority > maxPriority) {
            throw new Error(
                `Error while creating task: Max priority for tasks is ${maxPriority}`,
            );
        }

        if (dueDate < new Date()) {
            throw new Error(
                "Error while creating task: Due date must be in future",
            );
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
            throw new Error(
                `Error For Task <${this.#title}>: Max priority for tasks is ${maxPriority}`,
            );
        }

        this.#priority = newPriority;
    }

    get priority() {
        return this.#priority;
    }

    set dueDate(newDate) {
        if (newDate < new Date()) {
            throw new Error(
                `Error For Task <${this.#title}>: Due date must be in future`,
            );
        }

        this.#dueDate = newDate;
    }

    get dueDate() {
        return this.#dueDate;
    }

    get state() {
        return this.#state;
    }

    #setState(newState) {
        this.#state = newState;

        return this.#state;
    }

    complete() {
        if (this.#state === "completed") {
            throw new Error(
                `Error For Task <${this.#title}>: Already marked as completed`,
            );
        }

        this.#setState("completed");
    }

    uncomplete() {
        if (this.#state !== "completed") {
            throw new Error(
                `Error For Task <${this.#title}>: Task State isn't completed`,
            );
        }

        const currentTime = new Date();

        if (currentTime > this.#dueDate) {
            this.#setState("due");
        } else {
            this.#setState("ongoing");
        }
    }

    markAsDue() {
        this.#setState("due");
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
