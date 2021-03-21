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

let seconds = 0, minutes = 25, hours = 0;
let timerID = 0;

calculateTasksCount();
updateTimerText();

// TODO: включить случай строки без пробелов и переносов(разбить ее на части через каждые 50 символов)

input.addEventListener('input', e => {
    if (input.value === '') {
        chars.textContent = '';
        return;
    }

    chars.textContent = input.value.length + '/' + input.getAttribute('maxlength');
});

input.addEventListener('keydown', e => {
    if (e.keyCode === 13 && input.value !== '') {
        createTask(input.value);
        input.value = '';
        chars.textContent = '';
        calculateTasksCount();
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
    let section = document.createElement('section');
    section.classList.add('task');
    section.classList.add('flex');

    let divActions = document.createElement('div');
    divActions.classList.add('actions');
    divActions.classList.add('flex');

    let start = document.createElement('button');
    start.classList.add('start');
    start.textContent = 'START';
    let done = document.createElement('button');
    done.classList.add('done');
    done.textContent = 'DONE';
    done.addEventListener('click', e => {
        e.stopPropagation();
        tasks.removeChild(e.path[2]);
        calculateTasksCount();
    });
    let del = document.createElement('button');
    del.classList.add('delete');
    del.textContent = 'DELETE';

    let divDesc = document.createElement('div');
    divDesc.classList.add('task-description');
    divDesc.classList.add('flex');

    let p = document.createElement('p');
    p.textContent = text;

    divActions.appendChild(start);
    divActions.appendChild(done);
    divActions.appendChild(del);
    divDesc.appendChild(p);

    section.appendChild(divActions);
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
        taskDescription.textContent = e.currentTarget.querySelector('.task-description > p').textContent;
    });

    tasks.appendChild(section);
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
    if (time < 10)
        return '0' + time;
    else
        return time;
}