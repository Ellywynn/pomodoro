const currentTask = document.querySelector('.current-task');
const taskList = document.querySelector('.task-list');
const notification = document.querySelector('#alert');

let DEFAULT_SESSION = 25;
let DEFAULT_BREAK = 5;
let DEFAULT_LONG_BREAK = 30;
let DEFAULT_BREAK_COUNT = 4;

let settings = [];

let seconds = 0, minutes = DEFAULT_SESSION;
let timerID = 0, breakCount = 0;

let timerIsActive = false;
let isBreakTime = false;

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
            $('body').toggleClass('no-scroll');
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
                $('body').toggleClass('no-scroll');
            }
        });

        resetSettings();
        $('.inner.settings .save').click(e => saveSettings());
        $('.inner.settings .reset').click(e => resetSettings());

        // change the volume of the track
        $(document).on('input change', '.inner.music input', e => {
            e.stopPropagation();
            e.originalEvent.path[1].querySelector('audio').volume = parseInt(e.target.value) / 100;
        });

        // toggle pause/play track
        $('.play-button').click(e => {
            e.target.classList.toggle('fa-play');
            e.target.classList.toggle('fa-pause');
            let audio = e.originalEvent.path[1].querySelector('audio');
            if (e.target.classList.contains('fa-play')) audio.pause();
            else audio.play();
        });
    });
}

function initElements() {
    $('.action.start').click(e => startTimer());
    $('.action.pause').click(e => pauseTimer());
    $('.action.stop').click(e => stopTimer());
    document.querySelector('.action.delete').addEventListener('click', deleteTask);
    notification.volume = 0.5;

    const input = document.querySelector('#add-task-input');
    const chars = document.querySelector('#chars');
    const descTextarea = document.querySelector('.description textarea');
    const descText = document.querySelector('.description p');
    const saveEdit = document.querySelector('.edit-state .actions .save');
    const cancelEdit = document.querySelector('.edit-state .actions .delete');

    descText.addEventListener('click', e => {
        e.stopPropagation();
        toggleEditBlock();
        descTextarea.focus();
        descTextarea.value = descText.textContent;
        descTextarea.setSelectionRange(
            descTextarea.value.length, descTextarea.value.length);
    });

    saveEdit.addEventListener('click', e => {
        e.stopPropagation();
        setCurrentTaskDescription(descTextarea.value);
        changeCurrentTaskText(descTextarea.value);
        toggleEditBlock();
        updateTitleTime();
    });

    cancelEdit.addEventListener('click', e => {
        e.stopPropagation();
        toggleEditBlock();
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
        input.blur();
    });

    document.querySelectorAll('.inner.backgrounds').forEach(item => {
        item.addEventListener('click', changeBackground);
    })
}

function createTask(text) {
    let section = createElement('section', 'task');

    let total = createElement('p', 'total');
    total.textContent = settings['SESSION'] + ':00';
    section.appendChild(total);

    let taskInfo = createElement('div', 'task-info');

    let taskDuration = createElement('p', 'task-duration');
    taskDuration.textContent = settings['SESSION'] + ':00';

    let taskSessions = document.createElement('div');
    taskSessions.classList.add('task-sessions');

    let p = document.createElement('p');
    p.textContent = 'sessions: ';
    let sessionCount = document.createElement('span');
    sessionCount.classList.add('session-count');
    sessionCount.textContent = '1';
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
    deleteButton.addEventListener('click', deleteTask);

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

    // when users click on the task
    section.addEventListener('click', e => {
        e.stopPropagation();
        saveCurrentTask();
        // remove the current class from current task
        // add it to the clicked task
        $('.current').removeClass('current');
        setCurrentTask(e.currentTarget);
        currentTask.scrollIntoView();
    });

    // if this is the first task, set it to the current task
    if (calculateTasksCount() === 0) {
        displayTaskDescription();
        setRemainingText(formatTimeText(settings['SESSION'], 0));
        setCurrentTask(section);
        currentTask.classList.add('flex');
        currentTask.scrollIntoView();
        document.querySelector('#add-task-input').scrollIntoView();
    }
    document.querySelector('#tasks').appendChild(section);
    updateTaskList();
}

function calculateTasksCount() {
    let count = Array.from(document.querySelectorAll('.task')).length;
    return count;
}

function startTimer() {
    if (timerIsActive) return;
    if (getSessionCount() === 0) return;
    if (minutes === 0 && seconds === 0) minutes = settings['SESSION'];

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

    saveCurrentTask();

    if (minutes === 0 && seconds === 0) {
        if (isBreakTime) {
            stopBreakSession();
            return;
        }
        stopTimer();
        startBreakSession();
    }
    else
        updateTimerText();
}

function stopTimer() {
    if (isBreakTime) {
        stopBreakSession();
        return;
    }
    stopCurrentSession();
    clearInterval(timerID);
    resetTime();
    updateTimerText();
    timerIsActive = false;
}

function pauseTimer() {
    if (!timerIsActive) return;
    clearInterval(timerID);
    updateTimerText();
    saveCurrentTask();
    timerIsActive = false;
}

function updateTimerText() {
    $('#time').text(formatTimeText(minutes, seconds));
    updateTitleTime();

    updateRemainingText();
}

function updateRemainingText() {
    let sessCount = getSessionCount();
    let min = (sessCount - 1) * settings['SESSION']
        + (minutes === 0 && seconds === 0 && sessCount > 0 ? settings['SESSION'] : minutes);
    let sec = seconds;
    setRemainingText(formatTimeText(min, sec));
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
    $('#task-count').hide();
}

function displayTaskDescription() {
    currentTask.hidden = false;
    taskList.hidden = false;
    $('#task-count').show();
}

function updateCurrentTask() {
    if (calculateTasksCount() === 0) {
        setCurrentTaskDescription('');
        hideCurrentTaskDescription();
        return;
    }

    updateTaskList();
}

function updateTaskList() {
    let count = calculateTasksCount();
    $('#task-count').text('you have ' + count + (count % 10 === 1 ? ' task' : ' tasks'));
}

function setCurrentTaskDescription(text) {
    $('.description p').text(text);
}

function addSession(e) {
    changeSessions(e, true);
}

function removeSession(e) {
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
    e.stopPropagation();
    let sessions = getTaskSessions(e);
    let time = getTaskTimeAsObject(e);

    if (isAdding) {
        if (sessions >= 10) return;
        time.min += settings['SESSION'];
        sessions++;
    } else {
        if (time.min <= settings['SESSION']) return;
        time.min -= settings['SESSION'];
        sessions--;
    }

    setTaskSessionText(e, sessions);
    setTaskTimerTime(e, time.min, time.sec);
    setTaskTotalText(e);
    let task = e.path[4];
    if (task.classList.contains('current')) setCurrentTask(task);
}

function stopCurrentSession() {
    let remaining = getRemainingTime();
    if (remaining.minutes !== 0 ||
        (remaining.minutes === 0 && remaining.seconds !== 0)) decrementTaskSession();
    resetTime();
    saveCurrentTask();
}

// updates the current task in the task list
function saveCurrentTask() {
    let remainSessions = getSessionCount();
    // if timer is stopped, just calculate left sessions time,
    // else add remaining minutes
    let min = (minutes === 0 && seconds === 0) ?
        remainSessions * settings['SESSION'] :
        (remainSessions - 1) * settings['SESSION'] + minutes;

    let remainTime = formatTimeText(min, seconds);
    setSessionCount(remainSessions);
    setRemainingText(remainTime);
    setCurrentTaskDuration(remainTime);
    setCurrentSession(remainSessions);
}

function resetTime() {
    minutes = 0;
    seconds = 0;
}

function decrementTaskSession() {
    setSessionCount(getSessionCount() - 1);
}

function getRemainingTime() {
    let time = getRemainigText().split(':');
    return { minutes: parseInt(time[0]), seconds: parseInt(time[1]) };
}

function updateTitleTime() {
    if (isBreakTime) {
        setTitleText(getTimeText() + ' - take a break!');
        return;
    }

    let task = getDescriptionText();
    let taskSubstr = task.length > 15 ? task.substring(0, 15) : task.substring(0, task.length);
    setTitleText(getTimeText() + ' - ' + taskSubstr);
}

function resetTitle() {
    setTitleText('pomodoro');
}

function getSessionCount() {
    return parseInt($('.current-task .current-count').text());
}

function setSessionCount(count) {
    $('.current-task .current-count').text(count);
}

function setTimeText(text) {
    $('#time').text(text);
}

function getTimeText() {
    return $('#time').text();
}

function setTitleText(text) {
    $('#title').text(text);
}

function getDescriptionText() {
    return $('.current-task .description p').text();
}

function setRemainingText(text) {
    $('.current-task .current-remaining').text(text)
}

function getRemainigText() {
    return $('.current-task .current-remaining').text();
}

function setCurrentTaskDuration(text) {
    $('.current .task-duration').text(text);
}

function setCurrentSession(count) {
    $('.current .session-count').text(count);
}

function setCurrentTotal(text) {
    $('.current-task .current-total').text(text);
}

function startBreakSession() {
    notification.play();
    breakCount++;
    isBreakTime = true;
    let isLongBreak = breakCount === settings['BREAK_COUNT'];
    minutes = isLongBreak ? settings['LONG_BREAK'] : settings['BREAK'];
    seconds = 0;
    breakCount = isLongBreak ? 0 : breakCount;
    setTimeText(formatTimeText(minutes, seconds));
    $('#time').addClass('break');
    updateTitleTime();
}

function stopBreakSession() {
    notification.play();
    timerIsActive = false;
    isBreakTime = false;
    minutes = settings['SESSION'];
    seconds = 0;
    clearInterval(timerID);
    updateTitleTime();
    updateTimerText();
    $('#time').removeClass('break');
}

function deleteTask(e) {
    e.stopPropagation();
    pauseTimer();
    // if we are click delete button from the timer tab,
    // find and delete current task
    if (e.currentTarget === document.querySelector('.action.delete'))
        $('.current').remove();
    else
        document.querySelector('#tasks').removeChild(e.path[3]);

    // if there is no tasks anymore, hide everything
    if (calculateTasksCount() === 0) {
        currentTask.classList.remove('flex');
        resetBreakCount();
        hideCurrentTaskDescription();
        resetTitle();
        return;
    }

    // if we deleted the current task, set the first one
    // from the task list to the current
    if (getCurrentTask() === null)
        setCurrentTask(document.querySelector('.task'));

    updateTaskList();
}

function setCurrentTask(task) {
    resetBreakCount();
    task.classList.add('current');
    // get task time and reset global timer
    let time = task.querySelector('.task-duration').textContent.split(':');
    let min = parseInt(time[0]);
    let sec = parseInt(time[1]);
    let sessCount = parseInt(task.querySelector('.session-count').textContent);
    if (min > settings['SESSION']) {
        min = Math.floor(min / sessCount);
        sec = 0;
    }
    minutes = min;
    seconds = sec;
    setCurrentTaskDescription(task.querySelector('.task-description p').textContent);
    setSessionCount(sessCount);
    setCurrentTotal(task.querySelector('.total').textContent);
    updateTimerText();
}

function getCurrentTask() {
    return document.querySelector('.current');
}

function createElement(element, ...classes) {
    if (!element) return;
    let temp = document.createElement(element);
    classes.forEach(item => temp.classList.add(item));
    return temp;
}

function changeBackground(e) {
    e.stopPropagation();
    $('#background img').attr('src', (e.path[1].querySelector('img').src));
}

function saveSettings() {
    let inputs = document.querySelectorAll('.inner.settings input');
    inputs.forEach(setting => {
        let value = setting.value.trim();
        // if entered value is corrupted, set it to the current value
        if (/\D/.test(value)) { setting.value = settings[setting.id]; return; }

        settings[setting.id] = parseInt(value);
    });

    updateEveryTask();
}

function resetSettings() {
    settings['SESSION'] = DEFAULT_SESSION;
    settings['BREAK'] = DEFAULT_BREAK;
    settings['LONG_BREAK'] = DEFAULT_LONG_BREAK;
    settings['BREAK_COUNT'] = DEFAULT_BREAK_COUNT;

    let sets = document.querySelectorAll('.inner.settings input');
    sets.forEach(input => input.value = settings[input.id]);
}

function updateEveryTask() {
    let tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        let sessionCount = parseInt(task.querySelector('.session-count').textContent);
        let time = formatTimeText(sessionCount * settings['SESSION'], 0);
        task.querySelector('.task-duration').textContent = time;
        task.querySelector('.total').textContent = time;
    });
    setCurrentTask(getCurrentTask());
}

function resetBreakCount() {
    breakCount = 0;
}

function changeCurrentTaskText(text) {
    let current = document.querySelector('.current');
    if (current) current.querySelector('.task-description p').textContent = text;
}

function toggleEditBlock() {
    const descText = document.querySelector('.description p');
    const editBlock = document.querySelector('.edit-state');
    descText.classList.toggle('visible');
    editBlock.classList.toggle('visible');
}