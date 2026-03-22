// 1. DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const prioritySelect = document.getElementById('prioritySelect');
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
    // 1. Define the point system
    const weights = {
        low: 1,
        medium: 2,
        high: 3
    };

    // 2. Calculate TOTAL possible points across all tasks
    const totalPoints = tasks.reduce(function(sum, task) {
        const priority = task.priority || 'medium'; // Backwards compatibility
        return sum + weights[priority];
    }, 0);

    // 3. Calculate EARNED points from completed tasks
    const earnedPoints = tasks.reduce(function(sum, task) {
        if (task.completed) {
            const priority = task.priority || 'medium';
            return sum + weights[priority];
        }
        return sum; // If not completed, add 0
    }, 0);

    // 4. Calculate the new weighted percentage
    const percentage = totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100);
    
    // 5. Animate the SVG Circle
    const offset = circumference - (percentage / 100 * circumference);
    progressFill.style.strokeDashoffset = offset;
    
    // 6. Update the Text UI
    progressPercent.innerText = `${percentage}%`;
    
    // We can keep the text showing physical task count, while the circle shows "effort" percentage
    const completedTasks = tasks.filter(t => t.completed).length;
    progressStat.innerText = `${completedTasks} of ${tasks.length} tasks`;
}

// 4. The Render Function
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(function(task, index) {
        const li = document.createElement('li');
        li.classList.add('task-item');

        // --- NEW: Priority Logic & Backwards Compatibility ---
        const taskPriority = task.priority || 'medium'; 
        
        // Add the color border class (e.g., 'priority-high')
        li.classList.add(`priority-${taskPriority}`); 

        const isDone = task.completed ? 'completed' : '';
        const isChecked = task.completed ? 'checked' : '';

        // --- NEW: Injected the badge span inside the task-content div ---
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
    
    // Always update progress when rendering
    updateProgressBar();
}

// 5. Add Task Logic
function addTask() {
    const textValue = taskInput.value.trim();
    if (textValue === '') return;

    // Grab the value from the dropdown ("low", "medium", or "high")
    const priorityValue = prioritySelect.value;

    // Push the new property into our object
    tasks.push({ 
        text: textValue, 
        completed: false,
        priority: priorityValue // NEW: Saving the priority
    });

    saveAndRender();
    taskInput.value = '';
    prioritySelect.value = 'medium'; // Reset dropdown to default
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


// --- Custom Background & Dropdown Logic ---
const bgMenuBtn = document.getElementById('bgMenuBtn');
const bgDropdown = document.getElementById('bgDropdown');
const triggerUpload = document.getElementById('triggerUpload');
const removeBgBtn = document.getElementById('removeBgBtn');
const bgUpload = document.getElementById('bgUpload');

// 1. Load saved background on startup
const savedBg = localStorage.getItem('studyBg');
if (savedBg) {
    document.body.style.backgroundImage = `url(${savedBg})`;
    document.body.style.animation = 'none'; 
}

// 2. Toggle the dropdown menu visibility
bgMenuBtn.addEventListener('click', function() {
    bgDropdown.classList.toggle('show');
});

// 3. Close the menu if the user clicks anywhere else on the page
document.addEventListener('click', function(event) {
    // If the click is NOT inside the button AND NOT inside the dropdown, close it
    if (!bgMenuBtn.contains(event.target) && !bgDropdown.contains(event.target)) {
        bgDropdown.classList.remove('show');
    }
});

// 4. Handle "Upload Image" click
triggerUpload.addEventListener('click', function() {
    bgUpload.click();
    bgDropdown.classList.remove('show'); // Close menu after clicking
});

// 5. Handle "Remove Image" click
removeBgBtn.addEventListener('click', function() {
    // Clear memory
    localStorage.removeItem('studyBg');
    
    // Reset CSS to default gradient
    document.body.style.backgroundImage = 'none';
    document.body.style.animation = 'gradientBG 15s ease-in infinite';
    
    // Close menu
    bgDropdown.classList.remove('show');
});

// 6. Handle the actual file upload (Same as before)
bgUpload.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;

    if (file.size > 4000000) {
        alert("This image is too large! Please choose a file under 4MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.animation = 'none'; 
        localStorage.setItem('studyBg', imageUrl);
    };
    reader.readAsDataURL(file);
});
