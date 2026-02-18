import TaskInterface from "./interfaces/tasks";
import { add } from "date-fns";

const currentDate = new Date();

let task = TaskInterface.createTask(
    "Test Task",
    "This is a task to test my taskinterface",
    // create task that is due in a weeks time
    add(currentDate, {
        weeks: 1,
    }),
    3,
);

console.log(task.status);
task.complete();
console.log(task.status);
task.uncomplete();
console.log(task.status);
task.markAsDue();
console.log(task.status);
