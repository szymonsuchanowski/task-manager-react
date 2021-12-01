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
                <h1 className='tasks__heading'>Manage tasks <span className='tasks__highlight'>like a boss!</span></h1>
                <section className='tasks__form form'>
                    <form className='form__section' onSubmit={this.addNewTask}>
                        <div className='form__container'>
                            <div className='form__wrapper form__wrapper--field'>
                                <input className='form__field'
                                    name='newTask' value={newTask}
                                    onChange={this.inputChange}
                                    placeholder='type new task here' />
                                <span className='form__field-border'></span>
                            </div>
                            <div className='form__wrapper form__wrapper--submit'>
                                <input className='form__submit'
                                    value='Add'
                                    type='submit' />
                            </div>
                        </div>
                        <div className='form__placeholder'>
                            {this.renderInfoMsg()}
                        </div>
                    </form>
                </section>
                <section className='tasks__wrapper tasks__wrapper--progress'>
                    <header className='tasks__subheading'>
                        <h2 className='tasks__subtitle tasks__subtitle--progress'>in progress</h2>
                        <p className='tasks__description'>
                            to maximize the effect, focus on <span className='tasks__highlight--banner'>one task</span>
                        </p>
                    </header>
                    {this.renderRunningTask()}
                </section>
                <div className='tasks__section'>
                    <section className='tasks__wrapper tasks__wrapper--scheduled'>
                        <h2 className='tasks__subtitle'>scheduled</h2>
                        <ul className='tasks__list tasks__list--plan'>
                            {this.renderScheduledTasksList()}
                        </ul>
                    </section>
                    <section className='tasks__wrapper tasks__wrapper--stopped'>
                        <h2 className='tasks__subtitle'>stopped</h2>
                        <ul className='tasks__list tasks__list--stop'>
                            {this.renderStoppedTasksList()}
                        </ul>
                    </section>
                    <section className='tasks__wrapper tasks__wrapper--completed'>
                        <h2 className='tasks__subtitle'>completed</h2>
                        <ul className='tasks__list tasks__list--done'>
                            {this.renderCompletedTasksList()}
                        </ul>
                    </section>
                </div>
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
            runningTask.isStarted = true;
            this.api.updateData(runningTask.id, runningTask)
                .then(() => this.loadTasks())
                .catch(err => console.error(err))
        } else {
            this.loadTasks();
        }
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
            isStarted: false,
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
                <p className='form__err'>task must be at least 5 characters long</p>
            );
        } else if (this.getTasksAmount() === 0) {
            return (
                <p className='form__info'>add first task and <span className='tasks__highlight'>start doing!</span></p>
            );
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
                <div className='tasks__running tasks__running--empty'>
                    <p className='tasks__msg'>no task in progress yet</p>
                </div>
            );
        };
    };

    renderScheduledTasksList() {
        const { tasks } = this.state;
        const scheduledTasksList = tasks.filter(task => (!task.isRemoved && !task.isStarted && !task.isDone));
        return this.renderTaskList(scheduledTasksList);
    };

    renderStoppedTasksList() {
        const { tasks } = this.state;
        const stoppedTasksList = tasks.filter(task => (!task.isRemoved && task.isStarted && !task.isDone));
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
        const runningTask = this.findRunningTask();
        const { id, isRunning } = task;
        return (
            <li className={this.setListItemClass(runningTask, isRunning)} key={id}>
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
                <p className='tasks__info'>in progress</p>
            </header>
        );
    };

    renderFooter(task) {
        const { isRunning, isDone } = task;
        const runningTask = this.findRunningTask();
        return (
            <footer className='tasks__footer'>
                <button
                    className={this.setStartBtnClass(isDone, isRunning)}
                    disabled={runningTask && !isRunning}
                    title={isRunning ? 'pause task' : 'start task'}
                    onClick={() => isRunning ? this.pauseTask(task) : this.startTask(task)}>
                    {this.setStartBtnContent(isRunning)}
                </button>
                <button
                    className={this.setCompleteBtnClass(isDone)}
                    title={isDone ? 'restore task' : 'mark as complete'}
                    onClick={() => isDone ? this.restoreTask(task) : this.completeTask(task)}>
                    {this.setCompleteBtnContent(isDone)}
                </button>
                <button
                    className={this.setDeleteBtnClass(isDone, isRunning)}
                    title={isRunning ? 'restore to scheduled' : 'delete task'}
                    onClick={() => isRunning ? this.cancelTask(task) : this.deleteTask(task)}>
                    {this.setDeleteBtnContent(isRunning)}
                </button>
            </footer>
        );
    };

    setStartBtnContent(isRunning) {
        return isRunning ? <i className='fas fa-pause tasks__icon tasks__icon--pause'></i> :
            <i className='fas fa-play tasks__icon tasks__icon--play'></i>;
    };

    setCompleteBtnContent(isDone) {
        return isDone ? <i className='fas fa-undo-alt tasks__icon tasks__icon--restore'></i> :
            <i className='fas fa-check tasks__icon tasks__icon--complete'></i>;
    };

    setDeleteBtnContent(isRunning) {
        return isRunning ? <i className='fas fa-times tasks__icon tasks__icon--cancel'></i> :
            <i className='far fa-trash-alt tasks__icon tasks__icon--delete'></i>
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
            isStarted: true,
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
            this.setTaskStateById(task.id, { isStarted: true });
            this.setRunningTaskState(null);
            this.stopTimer();
        };
    };

    cancelTask(task) {
        const newTaskStateData = {
            isRunning: false,
            isStarted: false,
            time: 0,
        };
        this.setTaskStateById(task.id, newTaskStateData);
        this.setRunningTaskState(null);
        this.stopTimer();
    };

    deleteTask(task) {
        const newTaskStateData = {
            isRemoved: true,
        };
        this.setTaskStateById(task.id, newTaskStateData);
        if (this.getTasksAmount() === 1) {
            this.setState({ isTaskInvalid: false });
        };
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

    setListItemClass(runningTask, isRunning) {
        if (!runningTask) {
            return 'tasks__item';
        } else if (isRunning) {
            return 'tasks__item tasks__item--active';
        } else {
            return 'tasks__item tasks__item--inactive';
        };
    };

    setStartBtnClass(isDone, isRunning) {
        if (isDone) {
            return 'tasks__btn--invisible';
        } else if (isRunning) {
            return 'tasks__btn tasks__btn--pause';
        } else {
            return 'tasks__btn tasks__btn--start';
        };
    };

    setCompleteBtnClass(isDone) {
        return isDone ? 'tasks__btn tasks__btn--restore' : 'tasks__btn tasks__btn--complete';
    };

    setDeleteBtnClass(isDone, isRunning) {
        if (isRunning) {
            return 'tasks__btn tasks__btn--cancel';
        } else if (isDone) {
            return 'tasks__btn tasks__btn--delete';
        } else {
            return 'tasks__btn--invisible';
        };
    };

    setTimerClass(testValue) {
        return testValue ? 'tasks__timer tasks__timer--active' : 'tasks__timer';
    };
};

export default TasksManager;