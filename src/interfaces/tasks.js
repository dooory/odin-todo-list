const maxPriority = 3;

class Task {
    #title;
    #id;
    #description;
    #priority;
    #dueDate;
    #state = "ongoing";
    #tags = [];

    constructor(id, title, description, dueDate, priority, state) {
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

        this.#setState(state);
    }

    set title(newTitle) {
        this.#title = newTitle;
    }

    get title() {
        return this.#title;
    }

    get id() {
        return this.#id;
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
        this.#state = newState ? newState : this.#state;

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

    _delete() {
        console.log(`Task with id <${this.#id}> deleted!`);
    }

    get tags() {
        return this.#tags;
    }

    addTag(tag) {
        this.#tags[tag.id] = tag;

        tag.addTask(this);
    }

    removeTag(tagId) {
        if (!this.#tags[tagId]) {
            throw new Error(
                `Error for Task <${this.#title}>, task does not have tag with id <${tagId}>`,
            );
        }

        delete this.#tags[tagId];
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

        this.#tasks[id]._delete();
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

        return dupeTask;
    }

    getTasks() {
        return this.#tasks;
    }
}

export default new TaskInterface();
