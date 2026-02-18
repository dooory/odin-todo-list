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

console.log(TaskInterface.getTasks());
TaskInterface.deleteTask(task.id);
console.log(TaskInterface.getTasks());
