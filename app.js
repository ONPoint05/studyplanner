// 1. DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const prioritySelect = document.getElementById('prioritySelect');

const progressFill = document.querySelector('.progress-ring__fill');
const progressPercent = document.getElementById('progress-percent');
const progressStat = document.getElementById('progress-stat');

const sideTaskList = document.getElementById('sideTaskList');
const sideProgressPercent = document.getElementById('side-progress-percent');
const sideProgressStat = document.getElementById('side-progress-stat');
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
    
    // 1. Get only the tasks for the currently clicked button
    const filteredTasks = tasks.filter(t => (t.priority || 'medium') === currentFilter);
    
    // --- NEW: Calculate and Update Side Stats ---
    const totalSide = filteredTasks.length;
    const completedSide = filteredTasks.filter(t => t.completed).length;
    const percentageSide = totalSide === 0 ? 0 : Math.round((completedSide / totalSide) * 100);

    sideProgressPercent.innerText = `${percentageSide}%`;
    sideProgressStat.innerText = `${completedSide} of ${totalSide} tasks`;

    // Change the percentage color to match the active priority!
    if (currentFilter === 'high') sideProgressPercent.style.color = '#fa5252';
    if (currentFilter === 'medium') sideProgressPercent.style.color = '#fab005';
    if (currentFilter === 'low') sideProgressPercent.style.color = '#4dabf7';
    // --------------------------------------------

    // 2. Render the list
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
        
        // NEW: Make it draggable and assign its array index
        li.setAttribute('draggable', 'true');
        li.setAttribute('data-index', index);

        const isDone = task.completed ? 'completed' : '';
        const isChecked = task.completed ? 'checked' : '';

        // NEW: Added the drag-handle SVG at the start of the task-content
        li.innerHTML = `
            <div class="task-content">
                <div class="drag-handle">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                </div>
                <input type="checkbox" class="task-checkbox" onchange="toggleTask(${index})" ${isChecked}>
                <span class="task-text ${isDone}">${task.text}</span>
                <span class="priority-badge badge-${taskPriority}">${taskPriority}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${index})">×</button>
        `;
        
        // NEW: Attach drag event listeners to this specific list item
        addDragEvents(li);

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

// ==========================================
// --- POMODORO TIMER LOGIC ---
// ==========================================

// 1. DOM Elements
const timeDisplay = document.getElementById('timeDisplay');
const startTimerBtn = document.getElementById('startTimerBtn');
const pauseTimerBtn = document.getElementById('pauseTimerBtn');
const resetTimerBtn = document.getElementById('resetTimerBtn');
const modeBtns = document.querySelectorAll('.mode-btn');

// 2. Timer State
let timerId = null; // Holds the interval ID so we can stop it later
let timeLeft = 25 * 60; // Start with 25 minutes (in seconds)
let isWorkMode = true; // Tracks if we are focusing or resting

// 3. Format and update the display
function updateTimeDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    // padStart ensures "9" becomes "09"
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    timeDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;
}

// 4. Timer Controls
function startTimer() {
    // Prevent multiple clicks from starting multiple fast-forwarding timers
    if (timerId !== null) return; 

    timerId = setInterval(() => {
        timeLeft--;
        updateTimeDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerId);
            timerId = null;
            alert(isWorkMode ? 'Focus session complete! Time for a break.' : 'Break is over! Let\'s get back to work.');
            resetTimer(); // Reset for the next round
        }
    }, 1000); // 1000 milliseconds = 1 second
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
}

function resetTimer() {
    pauseTimer(); // Stop it if it's running
    timeLeft = isWorkMode ? 25 * 60 : 5 * 60; // 25 mins for work, 5 mins for break
    updateTimeDisplay();
}

// 5. Button Event Listeners
startTimerBtn.addEventListener('click', startTimer);
pauseTimerBtn.addEventListener('click', pauseTimer);
resetTimerBtn.addEventListener('click', resetTimer);

// 6. Mode Switcher (Focus vs Break)
modeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        // Update active classes
        modeBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Update state based on the button clicked
        isWorkMode = this.getAttribute('data-mode') === 'work';
        
        // Reset the timer to the new mode's default time
        resetTimer();
    });
});

// Initialize the display when the app loads
updateTimeDisplay();

// ==========================================
// --- DRAG AND DROP LOGIC ---
// ==========================================

let dragStartIndex; // Remembers which item we picked up

function addDragEvents(item) {
    item.addEventListener('dragstart', dragStart);
    item.addEventListener('dragover', dragOver);
    item.addEventListener('drop', dragDrop);
    item.addEventListener('dragenter', dragEnter);
    item.addEventListener('dragleave', dragLeave);
    item.addEventListener('dragend', dragEnd);
}

function dragStart(e) {
    // Save the index of the item we just picked up
    dragStartIndex = +this.getAttribute('data-index');
    // Add a CSS class so we can make it transparent while dragging
    this.classList.add('dragging');
    // Required for Firefox compatibility
    e.dataTransfer.effectAllowed = 'move'; 
}

function dragOver(e) {
    e.preventDefault(); // By default, dropping is disabled. This turns it on.
    this.classList.add('drag-over'); // Adds a hover effect to the target
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {
    this.classList.remove('drag-over'); // Remove hover effect when we leave
}

function dragEnd() {
    this.classList.remove('dragging'); // Clean up when we drop it
}

function dragDrop() {
    this.classList.remove('drag-over');
    
    // Find out where we dropped it
    const dragEndIndex = +this.getAttribute('data-index');
    
    // Reorder the array!
    swapTasks(dragStartIndex, dragEndIndex);
}

// The function that actually alters your data
function swapTasks(fromIndex, toIndex) {
    // 1. Remove the item from its original spot
    const itemToMove = tasks.splice(fromIndex, 1)[0];
    // 2. Insert it into the new spot
    tasks.splice(toIndex, 0, itemToMove);
    // 3. Save to localStorage and redraw the screen!
    saveAndRender();
}