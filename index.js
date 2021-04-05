const chars = document.querySelector('#chars');
const taskCountText = document.querySelector('#task-count');
const tasks = document.querySelector('#tasks');
const timeText = document.querySelector('#time');
const allTasks = document.querySelectorAll('.task');
const currentTaskDescription = document.querySelector('.description p');
const currentTask = document.querySelector('.current-task');
const taskList = document.querySelector('.task-list');

let DEFAULT_SESSION = 22;
let DEFAULT_BREAK = 5;
let DEFAULT_LONG_BREAK = 30;
let DEFAULT_BREAK_COUNT = 4;

let seconds = 0, minutes = DEFAULT_SESSION;
let timerID = 0;
let timerIsActive = false;

init();

function init() {
    initMenu();
    initElements();
    updateCurrentTask();
}

function initMenu() {
    $(document).ready(() => {
        $('.menu-button').click(e => {
            e.stopPropagation();
            $('.menu-button,.menu').toggleClass('active');
            $('.inner').removeClass('visible');
        });

        $('#settings p').click(e => {
            $('#settings').css('height', '100%');
            $('.menu-action .settings').toggleClass('visible');
        });

        $('#music p').click(e => {
            $('#music').css('height', '100%')
            $('.menu-action .music').toggleClass('visible');
        });

        $('#backgrounds p').click(e => {
            $('#backgrounds').css('height', '100%')
            $('.menu-action .backgrounds').toggleClass('visible');
        });

        $('header,main,footer').click(e => {
            if ($('.menu-button').hasClass('active')) {
                $('.menu-button,.menu').toggleClass('active');
                $('.inner').removeClass('visible');
            }
        });
    });
}

function initElements() {
    const input = document.querySelector('#add-task-input');
    const startTaskTimer = document.querySelector('.action.start');
    const pauseTaskTimer = document.querySelector('.action.pause');
    const stopTaskTimer = document.querySelector('.action.stop');

    startTaskTimer.addEventListener('click', e => startTimer());
    pauseTaskTimer.addEventListener('click', e => pauseTimer());
    stopTaskTimer.addEventListener('click', e => stopTimer());

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
}

function createTask(text) {
    let section = document.createElement('section');
    section.classList.add('task');

    let total = document.createElement('p');
    total.textContent = DEFAULT_SESSION + ':00';
    total.classList.add('total');
    section.appendChild(total);

    let taskInfo = document.createElement('div');
    taskInfo.classList.add('task-info');

    let taskDuration = document.createElement('p');
    taskDuration.classList.add('task-duration');
    taskDuration.textContent = DEFAULT_SESSION + ':00';
    taskDuration.addEventListener('click', e => e.stopPropagation());

    let taskSessions = document.createElement('div');
    taskSessions.classList.add('task-sessions');

    let p = document.createElement('p');
    p.textContent = 'sessions: ';
    p.addEventListener('click', e => e.stopPropagation());
    let sessionCount = document.createElement('span');
    sessionCount.classList.add('session-count');
    sessionCount.textContent = '1';
    sessionCount.addEventListener('click', e => e.stopPropagation());
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
    addButton.addEventListener('click', addSession);
    subButton.addEventListener('click', removeSession);
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

    doneButton.addEventListener('click', e => e.stopPropagation());
    deleteButton.addEventListener('click', e => e.stopPropagation());

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
    desc.addEventListener('click', e => e.stopPropagation());
    taskDescription.appendChild(desc);

    section.appendChild(taskInfo);
    section.appendChild(taskDescription);

    // when users click on the task
    section.addEventListener('click', e => {
        e.stopPropagation();
        // remove the current class from current task
        // add it to the clicked task
        $('.current').removeClass('current');
        e.currentTarget.classList.add('current');

        setCurrentTaskDescription(e.currentTarget.querySelector('.task-description p').textContent);
        currentTask.scrollIntoView();
        // get task time and reset global timer
        let time = e.currentTarget.querySelector('.task-duration').textContent.split(':');
        let min = parseInt(time[0]);
        let sec = parseInt(time[1]);
        let sessCount = parseInt(e.currentTarget.querySelector('.session-count').textContent);
        if (min > DEFAULT_SESSION) {
            min = Math.floor(min / sessCount);
            sec = 0;
        }
        minutes = min;
        seconds = sec;
        $('.current-task .current-count').text(sessCount);
        $('.current-task .current-total').text(e.currentTarget.querySelector('.total').textContent);
        updateTimerText();
    });

    // if this is the first task, set it to the current task
    if (calculateTasksCount() === 0) {
        displayTaskDescription();
        setCurrentTaskDescription(text);
        updateTimerText(time.textContent);
        document.querySelector('#add-task-input').scrollIntoView();
        section.classList.add('current');
    }
    tasks.appendChild(section);
    updateTaskList();
}

function calculateTasksCount() {
    let count = Array.from(document.querySelectorAll('.task')).length;
    return count;
}

function startTimer() {
    if (timerIsActive) return;
    if (minutes < 0 && seconds < 0) return;
    if (minutes === 0 && seconds === 0) minutes = DEFAULT_SESSION;

    updateTimerText();
    timerID = setInterval(updateTimer, 1000);
    timerIsActive = true;
}

function updateTimer() {
    seconds--;
    if (seconds === -1) {
        minutes--;
        seconds = 59;
    }
    if (minutes === -1) {
        minutes = 59;
        seconds = 59;
    }

    if (minutes === 0 && seconds === 0) {
        stopTimer();
        alert('take a break!');
    }
    else
        updateTimerText();
}

function stopTimer() {
    stopCurrentSession();
    clearInterval(timerID);
    resetTime();
    updateTimerText();
    resetTitle();
    timerIsActive = false;
}

function pauseTimer() {
    if (!timerIsActive) return;
    clearInterval(timerID);
    updateTimerText();
    timerIsActive = false;
}

function updateTimerText(timer = timeText) {
    let str = '';
    str += formatTimeText(minutes, seconds);

    timer.textContent = str;
    updateRemainingText();
    updateTitleTime();
}

function updateRemainingText() {
    let sessCount = getSessionCount();
    let min = (sessCount - 1) * DEFAULT_SESSION
        + (minutes === 0 ? DEFAULT_SESSION : minutes);
    let sec = seconds;
    $('.current-task .current-remaining').text(formatTimeText(min, sec));
}

function formatTime(time) {
    if (time < 0) return 0;
    if (time < 10) return '0' + time;
    return time;
}

function formatTimeText(minutes, seconds) {
    return formatTime(minutes) + ':' + formatTime(seconds);
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
    if (calculateTasksCount() === 0) {
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

function addSession(e) {
    e.stopPropagation();
    changeSessions(e, true);
}

function removeSession(e) {
    e.stopPropagation();
    changeSessions(e, false);
}

function getTaskSessions(event) {
    return parseInt(event.path[2].querySelector('.session-count').textContent);
}

function getTaskTimeAsObject(e) {
    let time = getTaskTime(e).split(':');
    return { min: parseInt(time[0]), sec: parseInt(time[1]) };
}

let getTaskTime = (e) => e.path[3].firstChild.textContent;

let setTaskSessionText = (e, text) =>
    e.path[2].querySelector('.session-count').textContent = text;

let setTaskTimerTime = (e, min, sec) =>
    e.path[3].firstChild.textContent = formatTimeText(min, sec);

let setTaskTotalText = (e) =>
    e.path[4].querySelector('.total').textContent = getTaskTime(e);

function changeSessions(e, isAdding) {
    let sessions = getTaskSessions(e);
    let time = getTaskTimeAsObject(e);

    if (isAdding) {
        if (sessions >= 10) return;
        time.min += DEFAULT_SESSION;
        sessions++;
    } else {
        if (time.min <= DEFAULT_SESSION) return;
        time.min -= DEFAULT_SESSION;
        sessions--;
    }

    setTaskSessionText(e, sessions);
    setTaskTimerTime(e, time.min, time.sec);
    setTaskTotalText(e);
}

function stopCurrentSession() {
    let remaining = getRemainingTime();
    if (remaining.minutes !== 0 && remaining.seconds !== 0) decrementTaskSession();
    resetTime();
    saveCurrentTask();
}

// updates the current task in the task list
function saveCurrentTask() {
    let remainSessions = getSessionCount();
    let remainTime = formatTimeText(remainSessions * DEFAULT_SESSION, seconds);
    $('.current-task .current-count').text(remainSessions);
    $('.current-task .current-remaining').text(remainTime);
    $('.current .session-count').text(remainSessions);
    $('.current .task-duration').text(remainTime);
}

function resetTime() {
    minutes = 0;
    seconds = 0;
}

function decrementTaskSession() {
    $('.current-task .current-count').text(getSessionCount() - 1);
}

function getSessionCount() {
    return parseInt($('.current-task .current-count').text());
}

function getRemainingTime() {
    let time = $('.current-task .current-remaining').text().split(':');
    return { minutes: parseInt(time[0]), seconds: parseInt(time[1]) };
}

function updateTitleTime() {
    let task = $('.current-task .description p').text();
    let taskSubstr = task.length > 15 ? task.substring(0, 15) : task.substring(0, task.length);
    $('#title').text($('#time').text() + ' - ' + taskSubstr);
}

function resetTitle() {
    $('#title').text('pomodoro');
}