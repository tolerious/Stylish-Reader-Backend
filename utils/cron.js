export class CronTask{
    constructor(){
        this.tasks = [];
    }

    addTask(task){
        this.tasks.push(task);
    }

    runTasks(){
        this.tasks.forEach(task => task());
    }
}