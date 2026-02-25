import TaskInterface from "./interfaces/tasks";
import TagInterface from "./interfaces/tags";
import { add } from "date-fns";

const currentDate = new Date();

let myTag = TagInterface.createTag("My Tag", {});

let task = TaskInterface.createTask(
    "Test Task",
    "This is a task to test my taskinterface",
    // create task that is due in a weeks time
    add(currentDate, {
        weeks: 1,
    }),
    3,
);

task.addTag(myTag);

console.log(task.tags);

TagInterface.deleteTag(myTag.id);

console.log(task.tags);
