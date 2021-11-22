class TasksManagerAPI {
    constructor() {
        this.url = 'http://localhost:3005/data';
    }

    loadData() {
        return this._fetch();
    }

    addData(data) {
        const options = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        return this._fetch(options);
    }

    updateData(id, data) {
        const options = {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        return this._fetch(options, `/${id}`);
    }

    _fetch(options, additionalPath = '') {
        const path = this.url + additionalPath;
        return fetch(path, options)
            .then(resp => {
                if (resp.ok) { return resp.json() }
                return Promise.reject(resp);
            });
    }
}

export default TasksManagerAPI;