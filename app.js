// 1. DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const prioritySelect = document.getElementById('prioritySelect');

const progressFill = document.querySelector('.progress-ring__fill');
const progressPercent = document.getElementById('progress-percent');
const progressStat = document.getElementById('progress-stat');

const sideTaskList = document.getElementById('sideTaskList');
const filterBtns = document.querySelectorAll('.filter-btn');

// 2. State Management
let tasks = JSON.parse(localStorage.getItem('studyTasks')) || [];
let currentFilter = 'high'; 

// 3. Main Progress Bar Logic (Weighted)
const radius = 50; 
const circumference = 2 * Math.PI * radius; 
progressFill.style.strokeDasharray = `${circumference} ${circumference}`;

function updateProgressBar() {
    const weights = { low: 1, medium: 2, high: 3 };

    const totalPoints = tasks.reduce((sum, task) => sum + weights[task.priority || 'medium'], 0);
    const earnedPoints = tasks.reduce((sum, task) => task.completed ? sum + weights[task.priority || 'medium'] : sum, 0);

    const percentage = totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);
    
    const offset = circumference - (percentage / 100 * circumference);
    progressFill.style.strokeDashoffset = offset;
    
    progressPercent.innerText = `${percentage}%`;
    const completedTasks = tasks.filter(t => t.completed).length;
    progressStat.innerText = `${completedTasks} of ${tasks.length} tasks`;
}

// 4. Side Panel Logic (Concentric Rings)
const rings = {
    low: { el: document.querySelector('.ring-low'), radius: 30 },
    medium: { el: document.querySelector('.ring-medium'), radius: 50 },
    high: { el: document.querySelector('.ring-high'), radius: 70 }
};

for (const key in rings) {
    const ring = rings[key];
    ring.circumference = 2 * Math.PI * ring.radius;
    ring.el.style.strokeDasharray = `${ring.circumference} ${ring.circumference}`;
    ring.el.style.strokeDashoffset = ring.circumference;
}

function updateConcentricRings() {
    ['low', 'medium', 'high'].forEach(priorityLevel => {
        const priorityTasks = tasks.filter(t => (t.priority || 'medium') === priorityLevel);
        const total = priorityTasks.length;
        const completed = priorityTasks.filter(t => t.completed).length;
        
        const percentage = total === 0 ? 0 : (completed / total);
        const ring = rings[priorityLevel];
        ring.el.style.strokeDashoffset = ring.circumference - (percentage * ring.circumference);
    });
}

function renderSidePanel() {
    sideTaskList.innerHTML = '';
    const filteredTasks = tasks.filter(t => (t.priority || 'medium') === currentFilter);
    
    filteredTasks.forEach(task => {
        const originalIndex = tasks.indexOf(task);
        const li = document.createElement('li');
        li.classList.add('task-item', `priority-${currentFilter}`);
        const isDone = task.completed ? 'completed' : '';
        const isChecked = task.completed ? 'checked' : '';
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" onchange="toggleTask(${originalIndex})" ${isChecked}>
            <span class="task-text ${isDone}" style="opacity: ${task.completed ? '0.6' : '1'}">${task.text}</span>
        `;
        sideTaskList.appendChild(li);
    });
    
    updateConcentricRings();
}

// 5. Main Render Function
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(function(task, index) {
        const li = document.createElement('li');
        li.classList.add('task-item');
        
        const taskPriority = task.priority || 'medium'; 
        li.classList.add(`priority-${taskPriority}`); 

        const isDone = task.completed ? 'completed' : '';
        const isChecked = task.completed ? 'checked' : '';

        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" onchange="toggleTask(${index})" ${isChecked}>
                <span class="task-text ${isDone}">${task.text}</span>
                <span class="priority-badge badge-${taskPriority}">${taskPriority}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${index})">×</button>
        `;
        taskList.appendChild(li);
    });
    
    updateProgressBar();
}

// 6. Core Functions
function addTask() {
    const textValue = taskInput.value.trim();
    if (textValue === '') return;
    const priorityValue = prioritySelect.value;

    tasks.push({ text: textValue, completed: false, priority: priorityValue });
    saveAndRender();
    taskInput.value = '';
    prioritySelect.value = 'medium'; 
}

function saveAndRender() {
    localStorage.setItem('studyTasks', JSON.stringify(tasks));
    renderTasks();
    renderSidePanel(); // Updates side panel too!
}

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

filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.getAttribute('data-priority');
        renderSidePanel();
    });
});

// 8. Initial Load
renderTasks();
renderSidePanel();

// --- Background Logic ---
const bgMenuBtn = document.getElementById('bgMenuBtn');
const bgDropdown = document.getElementById('bgDropdown');
const triggerUpload = document.getElementById('triggerUpload');
const removeBgBtn = document.getElementById('removeBgBtn');
const bgUpload = document.getElementById('bgUpload');

const savedBg = localStorage.getItem('studyBg');
if (savedBg) {
    document.body.style.backgroundImage = `url(${savedBg})`;
    document.body.style.animation = 'none'; 
}

bgMenuBtn.addEventListener('click', () => bgDropdown.classList.toggle('show'));

document.addEventListener('click', (event) => {
    if (!bgMenuBtn.contains(event.target) && !bgDropdown.contains(event.target)) {
        bgDropdown.classList.remove('show');
    }
});

triggerUpload.addEventListener('click', () => { bgUpload.click(); bgDropdown.classList.remove('show'); });

removeBgBtn.addEventListener('click', () => {
    localStorage.removeItem('studyBg');
    document.body.style.backgroundImage = 'none';
    document.body.style.animation = 'gradientBG 15s ease-in infinite';
    bgDropdown.classList.remove('show');
});

bgUpload.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    if (file.size > 4000000) return alert("File under 4MB please.");

    const reader = new FileReader();
    reader.onload = function(e) {
        document.body.style.backgroundImage = `url(${e.target.result})`;
        document.body.style.animation = 'none'; 
        localStorage.setItem('studyBg', e.target.result);
    };
    reader.readAsDataURL(file);
});