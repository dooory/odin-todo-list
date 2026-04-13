import TagInterface from "./tags";
import TaskInterface from "./tasks";
import { formatDate } from "date-fns";
import { Dropdown } from "../components/dropdown";

const allTasksContainer = document.getElementById("allTasks");
const createTagDialog = document.getElementById("createTagDialog");
const addTaskDialog = document.getElementById("addTaskDialog");
const tagFilter = document.getElementById("searchTags");
const searchBar = document.getElementById("searchTasks");

const tagManager = document.getElementById("manageTagsDialog");
const managerTagsList = tagManager.querySelector(".tags-list");
const createTagOption = tagManager.querySelector(".create-tag-option");
const tagOptionTemplate = document.getElementById("tagOptionTemplate");

function deleteTaskElement(task) {
    const taskElement = getTaskElement(task);

    taskElement.remove();
}

function createTaskElementInDom(task) {
    let newTaskElement = createTaskElement(task);

    allTasksContainer.appendChild(newTaskElement);

    filterTaskElement(task, searchBar.value, tagFilter.value);

    return newTaskElement;
}

function createTaskElement(task) {
    const taskTemplate = document.getElementById("taskTemplate");

    let taskFragment = document.importNode(taskTemplate.content, true);
    let taskElement = taskFragment.querySelector(".task");
    taskElement.dataset.id = task.id;

    let taskContainer = taskFragment.querySelector(".task-container");

    taskContainer.classList.add(`priority-${task.priority}`);

    const stateCheckbox = taskContainer.querySelector(".task-checkbox");
    stateCheckbox.checked = task.state === "completed" ? true : false;
    toggleCompleteTask(stateCheckbox.checked);

    const title = taskContainer.querySelector(".title");
    title.textContent = task.title;

    const editingTitle = taskContainer.querySelector(".edit-task-title");
    editingTitle.value = task.title;

    const dueDate = taskContainer.querySelector(".due-date");
    dueDate.textContent = formatDate(task.dueDate, "dd-MM-yyyy");

    const bottom = taskContainer.querySelector(".bottom");

    const editingDate = taskContainer.querySelector(".edit-due-date");
    editingDate.valueAsDate = task.dueDate;

    const taskTagDropdown = new Dropdown({
        events: {
            onEntryClick: (clickedEntry, isEntrySelected) => {
                if (!isEntrySelected) {
                    task.removeTag(clickedEntry.id, true);
                } else {
                    task.addTag(clickedEntry.id);
                }

                filterTaskElement(task, searchBar.value, tagFilter.value);
            },

            onCreateEntryClick: () => createTagDialog.showModal(),
        },

        getEntryData: () => {
            const currentTags = TagInterface.tags;

            return currentTags.map((tag) => {
                let data = {};

                data.title = tag.title;
                data.id = tag.id;

                return data;
            });
        },
        isEntrySelected: (entry) => {
            return task.tags.indexOf(entry.id);
        },

        type: "tag",
        updateOnCreate: true,
        selectedEntriesPlaceholder: "No tags...",
        removeSelectedOnClick: false,
        ignoredElements: [addTaskDialog],
    });

    bottom.appendChild(taskTagDropdown.container);

    function showEditOptions() {
        body.querySelectorAll(".edit-option, .hide-on-edit").forEach(
            (element) => element.classList.add("activated"),
        );
    }

    function hideEditOptions() {
        body.querySelectorAll(".edit-option, .hide-on-edit").forEach(
            (element) => element.classList.remove("activated"),
        );
    }

    title.addEventListener("click", () => {
        if (!title.classList.contains("activated")) {
            showEditOptions();

            editingTitle.focus();
        }
    });

    dueDate.addEventListener("click", () => {
        if (!dueDate.classList.contains("activated")) {
            showEditOptions();

            editingDate.focus();
        }
    });

    function toggleCompleteTask(isComplete) {
        if (isComplete) {
            taskElement.classList.add("complete");
        } else if (!isComplete) {
            taskElement.classList.remove("complete");
        }
    }

    stateCheckbox.addEventListener("change", () => {
        const isChecked = stateCheckbox.checked;

        toggleCompleteTask(isChecked);

        if (isChecked) {
            task.complete();
        } else {
            task.uncomplete();
        }
    });

    const body = taskContainer.querySelector(".body");

    const saveButton = body.querySelector(".save-button");
    const cancelButton = body.querySelector(".cancel-button");
    const deleteButton = body.querySelector(".delete-button");
    const duplicateButton = body.querySelector(".duplicate-button");
    const editButton = body.querySelector(".edit-button");

    saveButton.addEventListener("click", () => {
        hideEditOptions();

        body.querySelectorAll("input[data-property]").forEach((element) => {
            let propName = element.dataset.property;
            let value = element.value;

            if (propName === "dueDate") {
                task.dueDate = new Date(value);
            } else if (propName === "title") {
                task.title = value;
            }
        });

        refreshTaskElement(task);
        filterTaskElement(task, searchBar.value, tagFilter.value);
    });

    cancelButton.addEventListener("click", () => {
        hideEditOptions();

        editingTitle.value = task.title;
        editingDate.valueAsDate = task.dueDate;
    });

    deleteButton.addEventListener("click", () => {
        deleteTaskElement(task);
        TaskInterface.deleteTask(task.id);
    });

    duplicateButton.addEventListener("click", () => {
        hideEditOptions();

        let dupeTask = TaskInterface.duplicateTask(task.id);
        let dupeTaskElement = createTaskElement(dupeTask);

        // Insert after current task element
        taskElement.insertAdjacentElement("afterend", dupeTaskElement);
    });

    editButton.addEventListener("click", () => showEditOptions());

    return taskElement;
}

function createAllTaskElements() {
    clearAllTaskElements();

    TaskInterface.tasks.forEach((task) => createTaskElementInDom(task));
}

function refreshAllTaskElements() {
    TaskInterface.tasks.forEach((task) => refreshTaskElement(task));
}

function refreshTaskElement(task) {
    const currentTaskElement = getTaskElement(task);
    const nextTaskElement = currentTaskElement.nextSibling;

    const activatedElements = currentTaskElement.querySelectorAll(".activated");
    const activatedClassNames = [];

    activatedElements.forEach((element) => {
        let classNames = "";

        element.classList.forEach((name) => {
            if (name === "activated") {
                return;
            }

            classNames = `${classNames}.${name}`;
        });

        activatedClassNames.push(classNames);
    });

    const oldInputValues = {
        "edit-task-title":
            currentTaskElement.querySelector(".edit-task-title").value,
        "edit-due-date":
            currentTaskElement.querySelector(".edit-due-date").value,
    };

    deleteTaskElement(task);

    let newTaskElement = createTaskElement(task);

    activatedClassNames.forEach((rule) => {
        const element = newTaskElement.querySelector(rule);

        element.classList.add("activated");
    });

    for (const className in oldInputValues) {
        if (!Object.hasOwn(oldInputValues, className)) continue;

        const element = newTaskElement.querySelector(`.${className}`);

        element.value = oldInputValues[className];
    }

    if (nextTaskElement) {
        allTasksContainer.insertBefore(newTaskElement, nextTaskElement);

        return newTaskElement;
    } else {
        allTasksContainer.appendChild(newTaskElement);

        return newTaskElement;
    }
}

function clearAllTaskElements() {
    allTasksContainer.innerHTML = "<h3>Tasks</h3>";
}

function getTaskElement(task) {
    return allTasksContainer.querySelector(`.task[data-id='${task.id}']`);
}

function filterTaskElements(searchQuery, selectedTagId) {
    const tasks = TaskInterface.tasks;

    tasks.forEach((task) =>
        filterTaskElement(task, searchQuery, selectedTagId),
    );
}

function filterTaskElement(task, searchQuery, selectedTagId) {
    const element = getTaskElement(task);

    const queryMatchesTitle = task.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    let hasSelectedTag =
        selectedTagId === "all" || task.tags.includes(selectedTagId);

    if (!queryMatchesTitle || !hasSelectedTag) {
        element.style.display = "none";
    } else {
        element.style.display = "block";
    }
}

function refreshTagsFilter() {
    tagFilter.innerHTML = "";

    const allTagsOption = document.createElement("option");
    allTagsOption.value = "all";
    allTagsOption.textContent = "All tags";
    allTagsOption.selected = true;

    tagFilter.appendChild(allTagsOption);

    const tags = TagInterface.tags;

    tags.forEach((tag) => {
        const tagOption = document.createElement("option");
        tagOption.value = tag.id;
        tagOption.textContent = tag.title;

        tagFilter.appendChild(tagOption);
    });
}

function createTagManagerEntry(tag) {
    const tagOptionClone = document.importNode(tagOptionTemplate.content, true);
    const newTagOption = tagOptionClone.querySelector(".tag-option");
    newTagOption.dataset.id = tag.id;

    const optionTitleText = newTagOption.querySelector(".tag-title-text");
    const optionTitleInput = newTagOption.querySelector(".tag-title-input");

    optionTitleText.textContent = tag.title;
    optionTitleInput.value = tag.title;

    const saveTagButton = newTagOption.querySelector(".save-tag-button");
    const renameTagButton = newTagOption.querySelector(".rename-tag-button");
    const deleteTagButton = newTagOption.querySelector(".delete-tag-button");

    saveTagButton.addEventListener("click", () => {
        tag.title = optionTitleInput.value;
        optionTitleText.textContent = tag.title;
        newTagOption.classList.remove("activated");
    });

    renameTagButton.addEventListener("click", () => {
        newTagOption.classList.add("activated");
        optionTitleInput.select();
    });

    deleteTagButton.addEventListener("click", () => {
        if (newTagOption.classList.contains("activated")) {
            newTagOption.classList.remove("activated");
        } else {
            TagInterface.deleteTag(tag.id);
        }
    });

    optionTitleInput.addEventListener("blur", () => {
        optionTitleInput.value = tag.title;
        newTagOption.classList.remove("activated");
    });

    managerTagsList.insertBefore(newTagOption, createTagOption);

    return newTagOption;
}

function refreshTagManager() {
    const currentTagOptions = managerTagsList.querySelectorAll(".tag-option");

    currentTagOptions.forEach((element) => element.remove());

    TagInterface.tags.forEach((tag) => createTagManagerEntry(tag));
}

export default {
    createTaskElementInDom,
    createAllTaskElements,
    filterTaskElements,
    refreshTagsFilter,
    refreshTagManager,
};
