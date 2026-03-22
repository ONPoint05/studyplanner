// 1. DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
// New Progress Elements
const progressFill = document.querySelector('.progress-ring__fill');
const progressPercent = document.getElementById('progress-percent');
const progressStat = document.getElementById('progress-stat');

// 2. State Management
let tasks = JSON.parse(localStorage.getItem('studyTasks')) || [];

// 3. Progress Bar Logic
const radius = 50; // Matches 'r' in HTML
const circumference = 2 * Math.PI * radius; // C = 2πr (approx 314)
progressFill.style.strokeDasharray = `${circumference} ${circumference}`;

function updateProgressBar() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    // Calculate how much of the "314px" string to hide
    const offset = circumference - (percentage / 100 * circumference);
    progressFill.style.strokeDashoffset = offset;
    
    // Update Text
    progressPercent.innerText = `${percentage}%`;
    progressStat.innerText = `${completed} of ${total} tasks`;
}

// 4. The Render Function
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(function(task, index) {
        const li = document.createElement('li');
        li.classList.add('task-item');
        const isDone = task.completed ? 'completed' : '';
        const isChecked = task.completed ? 'checked' : '';

        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" onchange="toggleTask(${index})" ${isChecked}>
                <span class="task-text ${isDone}">${task.text}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${index})">×</button>
        `;
        taskList.appendChild(li);
    });
    
    // Always update progress when rendering
    updateProgressBar();
}

// 5. Add Task Logic
function addTask() {
    const textValue = taskInput.value.trim();
    if (textValue === '') return;
    tasks.push({ text: textValue, completed: false });
    saveAndRender();
    taskInput.value = '';
}

// Helper to save and refresh
function saveAndRender() {
    localStorage.setItem('studyTasks', JSON.stringify(tasks));
    renderTasks();
}

// 6. Global Actions
window.deleteTask = function(index) {
    tasks.splice(index, 1);
    saveAndRender();
}

window.toggleTask = function(index) {
    tasks[index].completed = !tasks[index].completed;
    saveAndRender();
}

// 7. Event Listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

// 8. Initial Load
renderTasks();