import TaskInterface from "./interfaces/tasks";
import TagInterface from "./interfaces/tags";
import Renderer from "./interfaces/renderer";
import { add } from "date-fns";

const currentDate = new Date();

let workTag = TagInterface.createTag("Work");
let importantTag = TagInterface.createTag("Important");

let task = TaskInterface.createTask(
    "Test Task",
    "This is a task to test my task interface",
    // create task that is due in a weeks time
    add(currentDate, {
        weeks: 1,
    }),
    3,
);

task.addTag(importantTag);

let task2 = TaskInterface.createTask(
    "Task 2",
    "YESSS",
    add(currentDate, {
        minutes: 3,
    }),
    2,
);

Renderer.updateScreen();
