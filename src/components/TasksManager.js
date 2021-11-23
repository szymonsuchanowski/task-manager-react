import React from 'react';
import TasksManagerAPI from '../TasksManagerAPI';

class TasksManager extends React.Component {
    constructor() {
        super();
        this.api = new TasksManagerAPI();
    };

    state = {
        tasks: [],
        newTask: '',
        runningTask: null,
        isTaskValid: false,
    };

    render() {
        const { newTask } = this.state;
        return (
            <div className='tasks'>
                <h1 className='tasks__title'>Manage your tasks!</h1>
                <section className='tasks__form'>
                    <form className='form' onSubmit={this.addNewTask}>
                        <div className='form__wrapper'>
                            <label>
                                Add new task
                                <input className='form__field'
                                    name='newTask' value={newTask}
                                    onChange={this.inputChange}
                                    placeholder='type task here' />
                                <span className='form__field-border'></span>
                            </label>
                        </div>
                        <div className='form__wrapper'>
                            <input className='form__submit btn'
                                value='Add'
                                type='submit' />
                        </div>
                        <div className='form__placeholder'>
                            {this.renderInfoMsg()}
                        </div>
                    </form>
                </section>
                <section className='tasks__wrapper'>
                    <h2 className='tasks__subtitle'>Task in progress</h2>
                    <div className='tasks__running'>
                        {this.renderRunningTask()}
                    </div>
                </section>
                <section className='tasks__wrapper'>
                    <h2 className='tasks__subtitle'>Scheduled tasks</h2>
                    <ul className='tasks__list tasks__list--plan'>
                        {this.renderScheduledTasksList()}
                    </ul>
                </section>
                <section className='tasks__wrapper'>
                    <h2 className='tasks__subtitle'>Stopped tasks</h2>
                    <ul className='tasks__list tasks__list--stop'>
                        {this.renderStoppedTasksList()}
                    </ul>
                </section>
                <section className='tasks__wrapper'>
                    <h2 className='tasks__subtitle'>Completed tasks</h2>
                    <ul className='tasks__list tasks__list--done'>
                        {this.renderCompletedTasksList()}
                    </ul>
                </section>
            </div>
        );
    };

    componentDidMount() {
        this.loadTasks();
    };

    loadTasks() {
        this.api.loadData()
            .then(data => data.reverse())
            .then(data => this.setState({ tasks: data }))
            .catch(err => console.error(err))
    };

    addNewTask = e => {
        e.preventDefault();
        const { newTask } = this.state;
        if (this.isTitleValid(newTask)) {
            const task = this.createNewTask(newTask);
            this.setState({
                newTask: '',
                isTaskValid: false,
            });
            this.api.addData(task)
                .then(() => this.loadTasks())
                .catch(err => console.error(err))
        } else {
            this.setState({ isTaskValid: true });
        };
    };

    isTitleValid(title) {
        return title.trim().length > 4;
    };

    createNewTask(taskTitle) {
        return {
            title: taskTitle,
            time: 0,
            isRunning: false,
            isDone: false,
            isRemoved: false,
        };
    };

    inputChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value,
        });
    };

    renderInfoMsg() {
        if (this.state.isTaskValid) {
            return (
                <p className='form__msg'>
                    task title must be at least 5 characters long
                </p>
            );
        } else if (this.state.tasks.length === 0) {
            return (
                <p className='form__info'>
                    add your first task!
                </p>
            )
        }
    };

    renderRunningTask() {
        const runningTask = this.findRunningTask();
        if (runningTask) {
            return (
                <>
                    {this.renderHeader(runningTask)}
                    {this.renderFooter(runningTask)}
                </>
            );
        } else {
            return (
                <p className='tasks__msg'>No task in progress yet</p>
            );
        };
    };

    renderScheduledTasksList() {
        const { tasks } = this.state;
        const scheduledTasksList = tasks.filter(task => (!task.isRemoved && !task.isRunning && !task.isDone && task.time === 0));
        return this.renderTaskList(scheduledTasksList);
    };

    renderStoppedTasksList() {
        const { tasks } = this.state;
        const stoppedTasksList = tasks.filter(task => (!task.isRemoved && !task.isRunning && !task.isDone && task.time > 0));
        this.sortArrByTime(stoppedTasksList);
        return this.renderTaskList(stoppedTasksList);
    };

    renderCompletedTasksList() {
        const { tasks } = this.state;
        const completedTasksList = tasks.filter(task => (task.isDone && !task.isRemoved));
        this.sortArrByTime(completedTasksList);
        return this.renderTaskList(completedTasksList);
    };

    renderTaskList(tasksList) {
        return tasksList.map(task => this.renderTaskItem(task));
    };

    renderTaskItem(task) {
        const { id } = task;
        return (
            <li className='tasks__item' key={id}>
                {this.renderHeader(task)}
                {this.renderFooter(task)}
            </li>
        );
    };

    renderHeader(task) {
        const { title, time, isRunning } = task;
        return (
            <header className='tasks__header'>
                <h3 className='tasks__name'>{title}</h3>
                <p className='tasks__timer'>00:00:00</p>
            </header>
        );
    };

    renderFooter(task) {
        const { isRunning, isDone } = task;
        const runningTask = this.findRunningTask();
        return (
            <footer className='tasks__footer'>
                <button className={this.setStartBtnClass(!isDone)}
                    disabled={runningTask && !isRunning}
                    onClick={() => isRunning ? this.pauseTask(task) : this.startTask(task)}>
                    {isRunning ? 'Pause' : 'Start'}
                </button>
                <button className='tasks__btn tasks__btn--complete'
                    onClick={() => isDone ? this.restoreTask(task) : this.completeTask(task)}>
                    {isDone ? 'Restore' : 'Complete'}
                </button>
                <button className={this.setDeleteBtnClass(isDone)}
                    onClick={() => this.deleteTask(task)}>
                    Delete
                </button>
            </footer>
        );
    };

    startTask(task) {
        const newTaskStateData = {
            isRunning: true,
        };
        this.setTaskStateById(task.id, newTaskStateData);
        this.setRunningTaskState(task);
    };

    pauseTask(task) {
        const newTaskStateData = {
            isRunning: false,
        };
        this.setTaskStateById(task.id, newTaskStateData);
        this.setRunningTaskState(null);
    };

    restoreTask(task) {
        const newTaskStateData = {
            isDone: false,
        };
        this.setTaskStateById(task.id, newTaskStateData);
    };

    completeTask(task) {
        const newTaskStateData = {
            isRunning: false,
            isDone: true,
        };
        this.setTaskStateById(task.id, newTaskStateData);
        const { runningTask } = this.state;
        if (runningTask && runningTask.id === task.id) {
            this.setRunningTaskState(null);
        };
    };

    deleteTask(task) {
        const newTaskStateData = {
            isRemoved: true,
        };
        this.setTaskStateById(task.id, newTaskStateData);
    };

    setTaskStateById(id, newTaskStateDataObj) {
        this.setState(prevState => ({
            tasks: prevState.tasks.map(obj => (obj.id === id) ? { ...obj, ...newTaskStateDataObj } : obj),
        }), () => this.updateTask(id));
    };

    updateTask(id) {
        const editedTask = this.findTaskById(id);
        this.api.updateData(id, editedTask)
            .catch(err => console.error(err))
    };

    setRunningTaskState(propValue) {
        this.setState({
            runningTask: propValue,
        });
    };

    findRunningTask() {
        return this.state.tasks.find(task => task.isRunning);
    };

    findTaskById(id) {
        return this.state.tasks.find(task => task.id === id);
    };

    sortArrByTime(arr) {
        return arr.sort((a, b) => b.time - a.time);
    };

    setStartBtnClass(testValue) {
        return testValue ? 'tasks__btn tasks__btn--start' : 'tasks__btn--invisible';
    };

    setDeleteBtnClass(testValue) {
        return testValue ? 'tasks__btn tasks__btn--delete' : 'tasks__btn--invisible';
    };
};

export default TasksManager;