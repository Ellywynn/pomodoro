let input = document.querySelector('#add-task-input');
let chars = document.querySelector('#chars');
let taskCountText = document.querySelector('#task-count');
let tasks = document.querySelector('.task-list');
let timeText = document.querySelector('#time');
let allTasks = document.querySelectorAll('.task.flex');
let taskDescription = document.querySelector('.task-name');

let startTaskTimer = document.querySelector('#start-timer');
let pauseTaskTimer = document.querySelector('#pause-timer');
let stopTaskTimer = document.querySelector('#stop-timer');

let seconds = 0, minutes = 25, hours = 0;
let timerID = 0;
let taskCount = 0;

//calculateTasksCount();
//updateTimerText();

startTimer();

// TODO: включить случай строки без пробелов и переносов(разбить ее на части через каждые 50 символов)

// input.addEventListener('input', e => {
//     if (input.value === '') {
//         chars.textContent = '';
//         return;
//     }

//     chars.textContent = input.value.length + '/' + input.getAttribute('maxlength');
// });

// input.addEventListener('keydown', e => {
//     if (e.keyCode === 13 && input.value !== '') {
//         createTask(input.value);
//         let count = calculateTasksCount();
//         if (count === 1) taskDescription.textContent = input.value;
//         input.value = '';
//         chars.textContent = '';
//     }
// });

// startTaskTimer.addEventListener('click', e => {
//     startTimer();
// });

// pauseTaskTimer.addEventListener('click', e => {
//     pauseTimer();
// });

// stopTaskTimer.addEventListener('click', e => {
//     let time = stopTimer();
//     console.log('Time: ' + time.hours + ':' + time.minutes + ':' + time.seconds);
// });

function createTask(text) {
    let section = document.createElement('section');
    section.classList.add('task');
    section.classList.add('flex');

    let taskInfo = document.createElement('div');
    taskInfo.classList.add('task-info');

    let divActions = document.createElement('div');
    divActions.classList.add('actions');
    divActions.classList.add('flex');

    let start = document.createElement('button');
    start.classList.add('start');
    start.textContent = '>';
    let done = document.createElement('button');
    done.classList.add('done');
    done.textContent = 'v';
    let del = document.createElement('button');
    del.classList.add('delete');
    del.textContent = 'x';
    del.addEventListener('click', e => {
        e.stopPropagation();
        tasks.removeChild(e.path[3]);
        calculateTasksCount();
    });

    let taskTime = document.createElement('div');
    taskTime.classList.add('task-time');
    taskTime.classList.add('flex');

    let inputs = [];

    for (let i = 0; i < 3; i++) {
        inputs[i] = document.createElement('input');
        inputs[i].type = 'text';
        inputs[i].maxLength = '2';
        inputs[i].addEventListener('click', e => {
            e.stopPropagation();
        });
    }

    inputs[0].value = '00';
    inputs[1].value = '25';
    inputs[2].value = '00';

    let column1 = document.createElement('p');
    let column2 = document.createElement('p');
    column1.textContent = column2.textContent = ':';

    let pomodoroActions = document.createElement('div');
    pomodoroActions.classList.add('pomodoro-actions');
    pomodoroActions.classList.add('flex');

    let addButton = document.createElement('button');
    let subButton = document.createElement('button');

    addButton.classList.add('add');
    subButton.classList.add('sub');

    addButton.textContent = '+';
    subButton.textContent = '-';

    addButton.addEventListener('click', e => {
        e.stopPropagation();
        inputs[1].value = formatTime(parseInt(inputs[1].value) + 25);
        if (parseInt(inputs[1].value) >= 60) {
            inputs[0].value = formatTime(parseInt(inputs[0].value) + 1);
            inputs[1].value = formatTime(parseInt(inputs[1].value) - 60);
        }
    });

    subButton.addEventListener('click', e => {
        e.stopPropagation();
        if (inputs[0].value == 0 && inputs[1].value == 0) return;
        inputs[1].value = inputs[1].value - 25;
        if (inputs[1].value < 0) {
            inputs[0].value = formatTime(inputs[0].value - 1);
            inputs[1].value = formatTime(60 - (-inputs[1].value));
        } else {
            inputs[1].value = formatTime(inputs[1].value);
        }
    });

    let divDesc = document.createElement('div');
    divDesc.classList.add('task-description');
    divDesc.classList.add('flex');

    let p = document.createElement('p');
    p.textContent = text;

    divActions.appendChild(start);
    divActions.appendChild(done);
    divActions.appendChild(del);

    taskTime.appendChild(inputs[0]);
    taskTime.appendChild(column1);
    taskTime.appendChild(inputs[1]);
    taskTime.appendChild(column2);
    taskTime.appendChild(inputs[2]);

    pomodoroActions.appendChild(addButton);
    pomodoroActions.appendChild(subButton);

    divDesc.appendChild(p);

    taskInfo.appendChild(divActions);
    taskInfo.appendChild(taskTime);
    taskInfo.appendChild(pomodoroActions);

    section.appendChild(taskInfo);
    section.appendChild(divDesc);

    section.addEventListener('mouseover', e => {
        e.stopPropagation();
        e.currentTarget.style = 'background-color: #888;';
    });
    section.addEventListener('mouseout', e => {
        e.stopPropagation();
        e.currentTarget.style = "background-color: #666;";
    });
    section.addEventListener('click', e => {
        e.stopPropagation();
        stopTimer();
        taskDescription.textContent = e.currentTarget.querySelector('.task-description > p').textContent;
        hours = parseInt(inputs[0].value);
        minutes = parseInt(inputs[1].value);
        seconds = parseInt(inputs[2].value);
        updateTimerText();
    });

    tasks.appendChild(section);
    console.log(section);
}

function calculateTasksCount() {
    let count = Array.from(document.querySelectorAll('.task.flex')).length;
    taskCountText.textContent = 'You have ' + count + ' tasks';
    taskCount = count;
    if (count === 0) taskDescription.textContent = 'Task description';
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
    minutes = 25;
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