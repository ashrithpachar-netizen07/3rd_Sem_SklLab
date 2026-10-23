// Student Task Manager — add, delete, complete, search, filter, and save tasks.

const STORAGE_KEY = "studentTaskManagerTasks";
let tasks = [];
let currentFilter = "all";
let currentSearch = "";

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const searchInput = document.getElementById("search-input");
const taskFilter = document.getElementById("task-filter");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const message = document.getElementById("message");
const taskCount = document.getElementById("task-count");
const completedCount = document.getElementById("completed-count");
const pendingCount = document.getElementById("pending-count");
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progress-bar");

// Read saved tasks from Local Storage when the app starts.
function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        tasks = Array.isArray(parsed)
            ? parsed.filter(task =>
                task &&
                Number.isSafeInteger(task.id) &&
                typeof task.title === "string" &&
                typeof task.completed === "boolean"
            )
            : [];
    } catch (error) {
        tasks = [];
        console.error("Unable to load saved tasks:", error);
    }
    displayTasks();
}

// Save the complete task array so it survives browser refreshes.
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        showMessage("Your browser could not save the tasks. Check Local Storage settings.");
        console.error("Unable to save tasks:", error);
    }
}

// Add a task, preventing blank or whitespace-only entries.
function addTask(event) {
    event.preventDefault();
    const title = taskInput.value.trim();

    if (title.length === 0) {
        showMessage("Please enter a task before clicking Add task.");
        taskInput.focus();
        return;
    }

    tasks.push({
        id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
        title,
        completed: false
    });

    saveTasks();
    taskInput.value = "";
    showMessage("");
    displayTasks();
    taskInput.focus();
}

// Remove the selected task from the array.
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    displayTasks();
}

// Change a task's completed status.
function toggleTask(id) {
    tasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    displayTasks();
}

// Return tasks matching both the search term and selected filter.
function getVisibleTasks() {
    return tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(currentSearch.toLowerCase());
        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "pending" && !task.completed) ||
            (currentFilter === "completed" && task.completed);
        return matchesSearch && matchesFilter;
    });
}

// Update the task list, summary cards, progress bar, and empty state.
function displayTasks() {
    const visibleTasks = getVisibleTasks();
    taskList.replaceChildren();

    visibleTasks.forEach(task => {
        const item = document.createElement("li");
        item.className = task.completed ? "task-item completed" : "task-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Mark "${task.title}" as completed`);
        checkbox.addEventListener("change", () => toggleTask(task.id));

        const title = document.createElement("span");
        title.className = "task-title";
        // textContent safely displays user-entered text without interpreting HTML.
        title.textContent = task.title;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", `Delete "${task.title}"`);
        deleteButton.addEventListener("click", () => deleteTask(task.id));

        item.append(checkbox, title, deleteButton);
        taskList.appendChild(item);
    });

    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    taskCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
    progressText.textContent = `${percentage}% complete`;
    progressBar.style.width = `${percentage}%`;
    progressBar.parentElement.setAttribute("aria-label", `${percentage}% of tasks completed`);

    emptyState.hidden = visibleTasks.length > 0;
    if (visibleTasks.length === 0) {
        if (tasks.length === 0) {
            emptyState.querySelector("h3").textContent = "No tasks yet";
            emptyState.querySelector("p").textContent = "Add your first task above and make today count.";
        } else {
            emptyState.querySelector("h3").textContent = "No matching tasks";
            emptyState.querySelector("p").textContent = "Try another search term or change the filter.";
        }
    }
}

// Search immediately as the user types.
function searchTasks() {
    currentSearch = searchInput.value.trim();
    displayTasks();
}

// Filter tasks by All, Pending, or Completed.
function filterTasks() {
    currentFilter = taskFilter.value;
    displayTasks();
}

function showMessage(text) {
    message.textContent = text;
}

taskForm.addEventListener("submit", addTask);
searchInput.addEventListener("input", searchTasks);
taskFilter.addEventListener("change", filterTasks);

// Initialize the app.
loadTasks();
