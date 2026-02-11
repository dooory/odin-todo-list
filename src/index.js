import TaskInterface from "./interfaces/tasks";

TaskInterface.createTask(
    "Test Task",
    "This is a task to test my taskinterface",
);

console.log(TaskInterface.getTasks());
