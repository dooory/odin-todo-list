import TaskInterface from "./interfaces/tasks";

TaskInterface.createTask(
    "Test Task",
    "This is a task to test my taskinterface",
    1,
);

console.log(TaskInterface.getTasks());
