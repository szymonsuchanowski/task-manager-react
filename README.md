![Task Manager App screenshot](/assets/task-manager-mockup.png "Task Manager app screenshot")

&nbsp;

## 🔍 Overview

### Kanban Board App features

- **adding tasks**
- **tasks management**
    - **moving tasks** between sections scheduled, stopped, completed
    - **counting the time** of completing the task
    - **deleting tasks**
- saving / deleting tasks **using local API** (JSON Server)

&nbsp;

## 👨‍💻 Built with

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Webpack](https://img.shields.io/badge/Webpack-8DD6F9?style=for-the-badge&logo=Webpack&logoColor=white)
![Babel](https://img.shields.io/badge/Babel-F9DC3E?style=for-the-badge&logo=babel&logoColor=white)

&nbsp;

## ⚙️ Run Locally

The project uses [node](https://nodejs.org/en/) and [npm](https://www.npmjs.com/), follow the steps below to run it locally.

- Clone the project using

```bash
  git clone
```

- Go to the project directory and install dependencies

```bash
  npm i
```

- Run JSON Server (if you don't have JSON server installed globally then you need to install it using `npm install -g JSON-server` and then run JSON Server)

```bash
  npm run api
```

- Start developer mode

```bash
  npm start
```

- Task Manager App is ready to go:

    - site

        ```bash
        http://localhost:8080
        ```

    - tasks data (database)

        ```bash
        http://localhost:3005/data
        ```

&nbsp;

## 🔗 Useful resources

- [official React website](https://reactjs.org/docs/getting-started.html)

&nbsp;

## 🙏 Special thanks

Special thanks to my [Mentor - devmentor.pl](https://devmentor.pl/) for providing me with the task and code review.