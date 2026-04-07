import { refreshAllDropdownsOfType } from "../components/dropdown";
import TaskInterface from "./tasks";
import renderer from "./renderer";

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

        refreshAllDropdownsOfType("tag");

        currentTagInterface.saveTags();
    }

    addTask(taskId) {
        const taskIdIndex = this.#properties.tasks.indexOf(taskId);

        if (taskIdIndex >= 0) {
            throw new Error(
                `Error for tag <${this.#properties.title}>, tag already has task with id <${taskId}>`,
            );
        }

        this.#properties.tasks.push(taskId);

        currentTagInterface.saveTags();
    }

    removeTask(taskId) {
        const taskIdIndex = this.#properties.tasks.indexOf(taskId);

        if (taskIdIndex === -1) {
            throw new Error(
                `Error for Tag <${this.#properties.title}>, tag does not have task with id <${taskId}>`,
            );
        }

        this.#properties.tasks.splice(taskIdIndex, 1);

        currentTagInterface.saveTags();
    }

    removeAllTasks() {
        this.#properties.tasks.forEach((taskId) => {
            const task = TaskInterface.getTaskById(taskId);

            task.removeTag(this.#properties.id, false);
            this.removeTask(taskId);
        });
    }

    serialize() {
        return JSON.stringify(this.#properties);
    }
}

class TagInterface {
    #tags;

    constructor() {
        this.#tags = [];
    }

    get tags() {
        return this.#tags;
    }

    getTagById(tagId) {
        return this.#tags.find((tag) => tag.id === tagId);
    }

    createTag(title) {
        const id = crypto.randomUUID();

        const newTag = new Tag(id, title);

        this.#tags.push(newTag);

        refreshAllDropdownsOfType("tag");
        renderer.refreshTagsFilter();

        this.saveTags();

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

        refreshAllDropdownsOfType("tag");
        renderer.refreshTagsFilter();

        currentTagInterface.saveTags();
    }

    deleteAllTags() {
        this.#tags.forEach((tag) => this.deleteTag(tag.id));
    }

    #createTagFromJSON(json) {
        const parsedJSON = JSON.parse(json);

        if (this.#tags.find((tag) => tag.id === parsedJSON.id)) {
            throw new Error(`Tag with id <${parsedJSON.id}>, already exists`);
        }

        const newTag = new Tag(parsedJSON.id, parsedJSON.title);

        this.#tags.push(newTag);

        return newTag;
    }

    saveTags() {
        let serializedTagsInterface = this.#serialize();

        localStorage.setItem("tags", serializedTagsInterface);
    }

    loadSavedTags() {
        let savedtags = localStorage.getItem("tags");

        this.#deserialize(savedtags);
    }

    #deserialize(serializedTagInterface) {
        let serializedTags = JSON.parse(serializedTagInterface);

        serializedTags.forEach((tagJSON) => this.#createTagFromJSON(tagJSON));

        renderer.refreshTagsFilter();
    }

    #serialize() {
        let serializedTags = this.#tags.map((tag) => tag.serialize());

        return JSON.stringify(serializedTags);
    }
}

let currentTagInterface = new TagInterface();

export default currentTagInterface;
