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
    };

    render() {
        const { newTask } = this.state;
        return (
            <div className='tasks'>
                <h1 className='tasks__title'>Manage your tasks!</h1>
                <section className='tasks__form'>
                    <form className='form' onSubmit={this.addNewTask}>
                        <div className='form__row'>
                            <label>
                                Add new task
                                <input className='form__field'
                                    name='newTask' value={newTask}
                                    onChange={this.inputChange}
                                    placeholder='type task here' />
                                <span className='form__field-border'></span>
                            </label>
                        </div>
                        <div className='form__row'>
                            <input className='form__submit btn'
                                value='Add'
                                type='submit' />
                        </div>
                    </form>
                </section>
                <section className='tasks__wrapper'>
                    <h2 className='tasks__subtitle'>Task in progress</h2>
                    <div className='tasks__list tasks__list-progress'>
                        {this.renderTaskInProgress()}
                    </div>
                </section>
                <section className='tasks__wrapper'>
                    <h2 className='tasks__subtitle'>Scheduled tasks</h2>
                    <ul className='tasks__list tasks__list-plan'>
                        {this.renderScheduledTasksList()}
                    </ul>
                </section>
                <section className='tasks__wrapper'>
                    <h2 className='tasks__subtitle'>Stopped tasks</h2>
                    <ul className='tasks__list tasks__list-stop'>
                        {this.renderStoppedTasksList()}
                    </ul>
                </section>
                <section className='tasks__wrapper'>
                    <h2 className='tasks__subtitle'>Completed tasks</h2>
                    <ul className='tasks__list tasks__list-done'>
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
            .then((data) => this.setState({ tasks: data }))
    };

    addNewTask = e => {
        e.preventDefault();
        const { newTask } = this.state;
        if (newTask.length > 4) {
            const task = {
                title: newTask,
                time: 0,
                isRunning: false,
                isDone: false,
                isRemoved: false,
            };
            this.setState({
                newTask: '',
            });
            this.api.addData(task)
                .then(() => this.loadTasks())
        };
    };

    inputChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value,
        });
    };

    renderTaskInProgress() {
        const { tasks } = this.state;
        const taskInProgress = tasks.find(task => task.isRunning);
        if (taskInProgress) {
            return (
                <>
                    <header className='tasks__header'>
                        <h3 className='tasks__name'>{taskInProgress.title}</h3>
                        <p className='tasks__timer'>00:00:00</p>
                    </header>
                    <footer className='tasks__footer'>
                        <button className='tasks__btn'>Start/Pause</button>
                        <button className='tasks__btn'>Complete</button>
                    </footer>
                </>
            );
        } else {
            return (
                <p>No task in progress...</p>
            )
        }
    };

    renderScheduledTasksList() {
        const { tasks } = this.state;
        return tasks.map(task => {
            const { isRunning, isDone, isRemoved, time } = task;
            if (!isRunning && !isDone && !isRemoved && time === 0) {
                return this.renderTaskItem(task);
            };
        });
    };

    renderStoppedTasksList() {
        const { tasks } = this.state;
        return tasks.map(task => {
            const { isRunning, isDone, isRemoved, time } = task;
            if (!isRunning && !isDone && !isRemoved && time > 0) {
                return this.renderTaskItem(task);
            };
        });
    };

    renderCompletedTasksList() {
        const { tasks } = this.state;
        return tasks.map(task => {
            const { isDone, isRemoved } = task;
            if (isDone && !isRemoved) {
                return this.renderTaskItem(task);
            };
        });
    };

    renderTaskItem(task) {
        const { title, time, isRunning, isDone, id } = task;
        return (
            <li className='tasks__item' key={id}>
                <header className='tasks__header'>
                    <h3 className='tasks__name'>{title}</h3>
                    <p className='tasks__timer'>00:00:00</p>
                </header>
                <footer className='tasks__footer'>
                    <button className='tasks__btn'>Start/Pause</button>
                    <button className='tasks__btn'>Complete</button>
                    <button className='tasks__btn'>Delete</button>
                </footer>
            </li>
        );
    };
};

export default TasksManager;