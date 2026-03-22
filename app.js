// 1. DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

// 2. State Management
let tasks = JSON.parse(localStorage.getItem('studyTasks')) || [];

// 3. The Render Function
function renderTasks() {
    taskList.innerHTML = '';

    tasks.forEach(function(task, index) {
        const li = document.createElement('li');
        li.classList.add('task-item');
        
        // Check the memory to set the right CSS classes and attributes
        const isDone = task.completed ? 'completed' : '';
        const isChecked = task.completed ? 'checked' : ''; // Adds the 'checked' attribute if true

        // Notice we changed onclick to onchange for the checkbox,
        // and wrapped the checkbox and text inside a .task-content div
        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" onchange="toggleTask(${index})" ${isChecked}>
                <span class="task-text ${isDone}">${task.text}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${index})">×</button>
        `;
        
        taskList.appendChild(li);
    });
}
// 4. Add Task Logic
function addTask() {
    const textValue = taskInput.value.trim();
    if (textValue === '') return;

    // --- NEW: Pushing an Object instead of a String ---
    tasks.push({
        text: textValue,
        completed: false // Every new task starts out unfinished
    });

    localStorage.setItem('studyTasks', JSON.stringify(tasks));
    renderTasks();
    taskInput.value = '';
}

// 5. Delete Task Logic
window.deleteTask = function(index) {
    tasks.splice(index, 1);
    localStorage.setItem('studyTasks', JSON.stringify(tasks));
    renderTasks();
}

// 6. --- NEW: Toggle Complete Logic ---
window.toggleTask = function(index) {
    // This flips the boolean: if it's true, make it false. If false, make it true.
    tasks[index].completed = !tasks[index].completed;
    
    // Save the updated array to memory
    localStorage.setItem('studyTasks', JSON.stringify(tasks));
    
    // Redraw the screen so the strikethrough appears/disappears
    renderTasks();
}

// 7. Event Listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') { addTask(); }
});

// 8. Initial Load
renderTasks();