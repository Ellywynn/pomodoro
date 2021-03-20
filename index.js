let input = document.querySelector('#add-task-input');
let chars = document.querySelector('#chars');
let taskCount = document.querySelector('#task-count');
let tasks = document.querySelector('#tasks');
let timeText = document.querySelector('#time');
let allTasks = document.querySelectorAll('.task.flex');
let taskDescription = document.querySelector('.task-name');

let startTaskTimer = document.querySelector('#start-timer');
let pauseTaskTimer = document.querySelector('#pause-timer');
let stopTaskTimer = document.querySelector('#stop-timer');

let seconds = 0, minutes = 0, hours = 0;
let timerID = 0;

calculateTasksCount();

// TODO: включить случай строки без пробелов и переносов(разбить ее на части через каждые 50 символов)

for (let i = 0; i < allTasks.length; i++) {
    allTasks[i].addEventListener('mouseover', e => {
        e.stopPropagation();
        e.currentTarget.style = 'background-color: #888;';
    });
    allTasks[i].addEventListener('mouseout', e => {
        e.stopPropagation();
        e.currentTarget.style = "background-color: #666;";
    });
    allTasks[i].addEventListener('click', e => {
        e.stopPropagation();
        taskDescription.textContent = e.currentTarget.querySelector('.task-description > p').textContent;
    });
}

input.addEventListener('input', e => {
    if (input.value === '') {
        chars.textContent = '';
        return;
    }

    chars.textContent = input.value.length + '/' + input.getAttribute('maxlength');
});

input.addEventListener('keydown', e => {
    if (e.keyCode === 13 && input.value !== '') {
        tasks.innerHTML += createTask(input.value);
        input.value = '';
        chars.textContent = '';
        //calculateTasksCount();
    }
});

startTaskTimer.addEventListener('click', e => {
    startTimer();
});

pauseTaskTimer.addEventListener('click', e => {
    pauseTimer();
});

stopTaskTimer.addEventListener('click', e => {
    let time = stopTimer();
    console.log('Time: ' + time.hours + ':' + time.minutes + ':' + time.seconds);
});

function createTask(text) {
    return '<section class="task flex">' +
        '<div div class="actions flex">' +
        '<button class="start">></button>' +
        '<button class="done">v</button>' +
        '<button class="delete">x</button>' +
        '</div>' +
        '<div class="task-description flex">' +
        '<p>' + text + '</p>' +
        '</div>' +
        '</section>';
}

function calculateTasksCount() {
    let count = Array.from(document.querySelectorAll('.task.flex')).length;
    taskCount.textContent = 'You have ' + count + ' tasks';
}

function startTimer() {
    updateTimerText();
    timerID = setInterval(updateTimer, 1000);
}

function updateTimer() {
    seconds++;
    if (seconds === 60) {
        minutes++;
        seconds = 0;
    }
    if (minutes === 60) {
        hours++;
        minutes = 0;
    }

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
    if (time < 10)
        return '0' + time;
    else
        return time;
}