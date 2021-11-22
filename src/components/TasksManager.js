import React from 'react';

class TasksManager extends React.Component {
    state = {
        tasks: [],
        newTaskTitle: '',
    }

    onClick = () => {
        const { tasks } = this.state;
        console.log(tasks)
    }

    render() {
        const { newTaskTitle } = this.state;
        return (
            <div className='tasks'>
                <h1 className='tasks__header'>Manage your tasks!</h1>
                <article className='tasks__form'>
                    <form className='form' onSubmit={this.submitHandler}>
                        <div className='form__row'>
                            <label>
                                Add new task
                                <input className='form__field'
                                    name='task' value={newTaskTitle}
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
                </article>
            </div>
        );
    };

    
};

export default TasksManager;