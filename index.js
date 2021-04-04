const chars = document.querySelector('#chars');
const taskCountText = document.querySelector('#task-count');
const tasks = document.querySelector('#tasks');
const timeText = document.querySelector('#time');
const allTasks = document.querySelectorAll('.task');
const currentTaskDescription = document.querySelector('.description p');
const currentTask = document.querySelector('.current-task');
const taskList = document.querySelector('.task-list');

let seconds = 0, minutes = 0, hours = 0;
let timerID = 0;
let timerIsActive = false;

init();

// TODO: включить случай строки без пробелов и переносов(разбить ее на части через каждые 50 символов)

function init() {
    $(document).ready(() => {
        $('.menu-button').click(e => {
            e.stopPropagation();
            $('.menu-button,.menu').toggleClass('active');
        });
        console.log($('main'));
        $('header,main,footer').click(e => {
            if ($('.menu-button').hasClass('active')) {
                $('.menu-button,.menu').toggleClass('active');
            }
        });
    });

    const input = document.querySelector('#add-task-input');
    const startTaskTimer = document.querySelector('.action.start');
    const pauseTaskTimer = document.querySelector('.action.pause');
    const stopTaskTimer = document.querySelector('.action.stop');

    startTaskTimer.addEventListener('click', e => {
        if (!timerIsActive) {
            startTimer();
            timerIsActive = true;
        }
    });

    pauseTaskTimer.addEventListener('click', e => {
        if (timerIsActive) {
            pauseTimer();
            timerIsActive = false;
        }
    });

    stopTaskTimer.addEventListener('click', e => {
        let time = stopTimer();
    });

    input.addEventListener('input', e => {
        if (input.value === '') {
            chars.textContent = '';
            return;
        }

        chars.textContent = input.value.length + '/' + input.getAttribute('maxlength');
    });

    input.addEventListener('keydown', e => {
        if (!(e.keyCode === 13 && input.value !== '')) return;

        createTask(input.value);
        input.value = '';
        chars.textContent = '';
    });

    updateCurrentTask();
}

function createTask(text) {
    let section = document.createElement('section');
    section.classList.add('task');

    let taskInfo = document.createElement('div');
    taskInfo.classList.add('task-info');

    let taskDuration = document.createElement('p');
    taskDuration.classList.add('task-duration');
    taskDuration.textContent = '25:00';

    let taskSessions = document.createElement('div');
    taskSessions.classList.add('task-sessions');

    let p = document.createElement('p');
    p.textContent = 'sessions: ';
    let sessionCount = document.createElement('span');
    sessionCount.classList.add('session-count');
    sessionCount.textContent = '0';
    p.appendChild(sessionCount);

    let buttons1 = document.createElement('div');
    buttons1.classList.add('add-sub');
    buttons1.classList.add('flex');
    let addButton = document.createElement('button');
    let subButton = document.createElement('button');
    addButton.classList.add('add');
    subButton.classList.add('subtract');
    addButton.textContent = '+';
    subButton.textContent = '-';
    buttons1.appendChild(addButton);
    buttons1.appendChild(subButton);

    taskSessions.appendChild(p);
    taskSessions.appendChild(buttons1);

    let buttons2 = document.createElement('div');
    buttons2.classList.add('done-delete');
    buttons2.classList.add('flex');
    let doneButton = document.createElement('button');
    doneButton.classList.add('done');
    doneButton.textContent = 'done';
    let deleteButton = document.createElement('button');
    deleteButton.classList.add('delete');
    deleteButton.textContent = 'delete';

    buttons2.appendChild(doneButton);
    buttons2.appendChild(deleteButton);

    taskInfo.appendChild(taskDuration);
    taskInfo.appendChild(taskSessions);
    taskInfo.appendChild(buttons2);

    let taskDescription = document.createElement('div');
    taskDescription.classList.add('task-description');
    taskDescription.classList.add('flex');
    let desc = document.createElement('p');
    desc.textContent = text;
    taskDescription.appendChild(desc);

    section.appendChild(taskInfo);
    section.appendChild(taskDescription);

    section.addEventListener('click', e => {
        e.stopPropagation();
        stopTimer();
        setCurrentTaskDescription(e.currentTarget.querySelector('.task-description p').textContent);
        currentTask.scrollIntoView();
        updateTimerText();
    });

    if (calculateTasksCount() === 0) {
        displayTaskDescription();
        setCurrentTaskDescription(text);
        let taskTime = time.textContent.split(':');
        minutes = parseInt(taskTime[0]);
        seconds = parseInt(taskTime[1]);
        updateTimerText();
    }
    tasks.appendChild(section);
    updateTaskList();
}

function calculateTasksCount() {
    let count = Array.from(document.querySelectorAll('.task')).length;
    return count;
}

function startTimer() {
    updateTimerText();
    timerID = setInterval(updateTimer, 1000);
}

function updateTimer() {
    seconds--;
    if (seconds === -1) {
        minutes--;
        seconds = 59;
    }
    if (minutes === -1) {
        hours--;
        minutes = 59;
        seconds = 59;
    }

    if (hours === 0 && minutes === 0 && seconds === 0)
        stopTimer();
    else
        updateTimerText();
}

function stopTimer() {
    clearInterval(timerID);
    let time = { seconds: seconds, minutes: minutes, hours: hours };
    seconds = 0;
    minutes = 0;
    hours = 0;
    updateTimerText();
    return time;
}

function pauseTimer() {
    clearInterval(timerID);
    updateTimerText();
}

function updateTimerText() {
    let str = '';
    if (hours === 0)
        str += formatTime(minutes) + ':' + formatTime(seconds);
    else
        str += formatTime(hours) + ':' + formatTime(minutes) + ':' + formatTime(seconds);

    timeText.textContent = str;
}

function formatTime(time) {
    if (time < 0) return 0;
    if (time < 10) return '0' + time;
    return time;
}

function hideCurrentTaskDescription() {
    currentTask.hidden = true;
    taskList.hidden = true;
}

function displayTaskDescription() {
    currentTask.hidden = false;
    taskList.hidden = false;
}

function updateCurrentTask() {
    let count = calculateTasksCount();
    if (count === 0) {
        currentTaskDescription.textContent = '';
        hideCurrentTaskDescription();
        return;
    }

    updateTaskList();
}

function updateTaskList() {
    let count = calculateTasksCount();
    taskCountText.textContent = 'you have ' + count + (count % 10 === 1 ? ' task' : ' tasks');
}

function setCurrentTaskDescription(text) {
    currentTaskDescription.textContent = text;
}

function blinkSemicolon() {
    let counter = 0.0;
}