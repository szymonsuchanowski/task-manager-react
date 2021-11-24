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
        isTaskInvalid: false,
    };

    render() {
        const { newTask } = this.state;
        return (
            <div className='tasks'>
                <h1 className='tasks__heading'>Manage tasks <span className='tasks__highlight'>like a boss</span>!</h1>
                <section className='tasks__form form'>
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
                    <header className='tasks__subheading'>
                        <h2 className='tasks__subtitle'>Task in progress</h2>
                        <p className='tasks__description'>
                            to maximize the effect, focus on <span className='tasks__highlight'>one task</span>
                        </p>
                    </header>
                    {this.renderRunningTask()}
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
        this.api.loadData()
            .then(data => this.removeLastRunningTask(data))
            .catch(err => console.error(err))
    };

    removeLastRunningTask(data) {
        const runningTask = data.find(item => item.isRunning);
        if (runningTask) {
            runningTask.isRunning = false;
            this.api.updateData(runningTask.id, runningTask)
                .catch(err => console.error(err))
        };
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
                isTaskInvalid: false,
            });
            this.api.addData(task)
                .then(() => this.loadTasks())
                .catch(err => console.error(err))
        } else {
            this.setState({ isTaskInvalid: true });
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
        if (this.state.isTaskInvalid) {
            return (
                <p className='form__msg'>task title must be at least 5 characters long</p>
            );
        } else if (this.getTasksAmount() === 0) {
            return (
                <p className='form__info'>add first task and <span className='tasks__highlight'>start doing</span>!</p>
            )
        };
    };

    renderRunningTask() {
        const runningTask = this.findRunningTask();
        if (runningTask) {
            return (
                <div className='tasks__running'>
                    {this.renderHeader(runningTask)}
                    {this.renderFooter(runningTask)}
                </div>
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
            <header className='tasks__title'>
                <h3 className='tasks__name'>{title}</h3>
                <p className={this.setTimerClass(isRunning)}>
                    {new Date(time * 1000).toISOString().substring(11, 19)}
                </p>
            </header>
        );
    };

    renderFooter(task) {
        const { isRunning, isDone } = task;
        const runningTask = this.findRunningTask();
        return (
            <footer className='tasks__footer'>
                <button className={this.setBtnClass(!isDone, 'start')}
                    disabled={runningTask && !isRunning}
                    onClick={() => isRunning ? this.pauseTask(task) : this.startTask(task)}>
                    {isRunning ? 'Pause' : 'Start'}
                </button>
                <button className='tasks__btn tasks__btn--complete'
                    onClick={() => isDone ? this.restoreTask(task) : this.completeTask(task)}>
                    {isDone ? 'Restore' : 'Complete'}
                </button>
                <button className={this.setBtnClass(isDone, 'delete')}
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
        this.startTimer(task);
    };

    pauseTask(task) {
        const newTaskStateData = {
            isRunning: false,
        };
        this.setTaskStateById(task.id, newTaskStateData);
        this.setRunningTaskState(null);
        this.stopTimer();
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
            this.stopTimer();
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

    startTimer(task) {
        this.intervalId = setInterval(() => {
            task.time++;
            this.setTaskStateById(task.id, { time: task.time });
        }, 1000);
    };

    stopTimer() {
        clearInterval(this.intervalId);
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

    getTasksAmount() {
        const remainTaskList = this.state.tasks.filter(task => !task.isRemoved);
        return remainTaskList.length;
    };

    setBtnClass(testValue, btnType) {
        return testValue ? `tasks__btn tasks__btn--${btnType}` : 'tasks__btn--invisible';
    };

    setTimerClass(testValue) {
        return testValue ? 'tasks__timer tasks__timer--active' : 'tasks__timer';
    };
};

export default TasksManager;