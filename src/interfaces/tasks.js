import renderer from "./renderer";
import TagInterface from "./tags";

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

    addTag(tagId) {
        const tagIdIndex = this.#properties.tags.indexOf(tagId);

        if (tagIdIndex >= 0) {
            throw new Error(
                `Error for Task <${this.#properties.title}>, task already has tag with id <${tagId}>`,
            );
        }

        this.#properties.tags.push(tagId);
        TagInterface.getTagById(tagId).addTask(this.#properties.id);
    }

    removeTag(tagId, callRemoveTask) {
        const tagIdIndex = this.#properties.tags.indexOf(tagId);

        if (tagIdIndex === -1) {
            throw new Error(
                `Error for Task <${this.#properties.title}>, task does not have tag with id <${tagId}>`,
            );
        }

        this.#properties.tags.splice(tagIdIndex, 1);

        if (callRemoveTask) {
            TagInterface.getTagById(tagId).removeTask(this.#properties.id);
        }
    }
}

class TaskInterface {
    #tasks;

    constructor() {
        this.#tasks = [];
    }

    createTask(title, description, dueDate, priority, state) {
        const id = crypto.randomUUID();
        let task = new Task(id, title, description, dueDate, priority, state);

        this.#tasks.push(task);

        return task;
    }

    deleteTask(id) {
        let task = this.getTaskById(id);

        if (!task) {
            throw new Error(
                `Error when attempting to delete task with id <${id}>, unable to find such task`,
            );
        }

        task.tags.forEach((tagId) => {
            task.removeTag(tagId, true);
        });

        this.#tasks.splice(this.#tasks.indexOf(task), 1);
    }

    duplicateTask(id) {
        const originalTask = this.getTaskById(id);

        if (!this.getTaskById(id)) {
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

        originalTask.tags.forEach((tag) => {
            dupeTask.addTag(tag.id);
        });

        return dupeTask;
    }

    getTaskById(id) {
        return this.#tasks.find((task) => task.id === id);
    }

    getTasks() {
        return this.#tasks;
    }
}

export default new TaskInterface();
