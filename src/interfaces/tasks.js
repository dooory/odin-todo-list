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

        currentTaskInterface.saveTasks();
    }

    get title() {
        return this.#properties.title;
    }

    get id() {
        return this.#properties.id;
    }

    set description(newDescription) {
        this.#properties.description = newDescription;

        currentTaskInterface.saveTasks();
    }

    get description() {
        return this.#properties.description;
    }

    set priority(newPriority) {
        this.#properties.priority = newPriority;

        currentTaskInterface.saveTasks();
    }

    get priority() {
        return this.#properties.priority;
    }

    set dueDate(newDate) {
        this.#properties.dueDate = newDate;

        currentTaskInterface.saveTasks();
    }

    get tags() {
        return this.#properties.tags;
    }

    get dueDate() {
        return this.#properties.dueDate;
    }

    get state() {
        return this.#properties.state;
    }

    #setState(newState) {
        this.#properties.state = newState;

        currentTaskInterface.saveTasks();

        return this.#properties.state;
    }

    markAsDue() {
        this.#setState("due");
    }

    isDue() {
        return this.#properties.dueDate < new Date();
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

    addTag(tagId) {
        const tagIdIndex = this.#properties.tags.indexOf(tagId);

        if (tagIdIndex >= 0) {
            throw new Error(
                `Error for Task <${this.#properties.title}>, task already has tag with id <${tagId}>`,
            );
        }

        this.#properties.tags.push(tagId);
        TagInterface.getTagById(tagId).addTask(this.#properties.id);

        currentTaskInterface.saveTasks();
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

        currentTaskInterface.saveTasks();
    }

    serialize() {
        return JSON.stringify(this.#properties);
    }
}

class TaskInterface {
    #tasks;

    constructor() {
        this.#tasks = [];
    }

    get tasks() {
        return this.#tasks;
    }

    createTask(title, description, dueDate, priority, state) {
        const id = crypto.randomUUID();
        let task = new Task(id, title, description, dueDate, priority, state);

        this.#tasks.push(task);

        this.saveTasks();

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

        currentTaskInterface.saveTasks();
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

        originalTask.tags.forEach((id) => {
            dupeTask.addTag(id);
        });

        currentTaskInterface.saveTasks();

        return dupeTask;
    }

    deleteAllTasks() {
        this.#tasks.forEach((task) => this.deleteTask(task.id));
    }

    getTaskById(id) {
        return this.#tasks.find((task) => task.id === id);
    }

    #createTaskFromJSON(json) {
        const parsedJSON = JSON.parse(json);

        if (this.#tasks.find((task) => task.id === parsedJSON.id)) {
            throw new Error(`Task with id <${parsedJSON.id}>, already exists`);
        }

        let task = new Task(
            parsedJSON.id,
            parsedJSON.title,
            parsedJSON.description,
            new Date(parsedJSON.dueDate),
            parsedJSON.priority,
            parsedJSON.state,
        );

        parsedJSON.tags.forEach((tagId) => task.addTag(tagId));

        this.#tasks.push(task);

        this.saveTasks();

        return task;
    }

    #deserialize(serializedTaskInterface) {
        const serializedTasks = JSON.parse(serializedTaskInterface);

        serializedTasks.forEach((taskJSON) =>
            this.#createTaskFromJSON(taskJSON),
        );
    }

    #serialize() {
        let serializedTasks = this.#tasks.map((task) => task.serialize());

        return JSON.stringify(serializedTasks);
    }

    saveTasks() {
        let serializedTaskInterface = this.#serialize();

        localStorage.setItem("tasks", serializedTaskInterface);
    }

    loadSavedTasks() {
        let savedTasks = localStorage.getItem("tasks");

        this.#deserialize(savedTasks);
    }
}

let currentTaskInterface = new TaskInterface();

export default currentTaskInterface;
