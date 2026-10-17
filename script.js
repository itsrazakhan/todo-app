
/* =========================
   1. SELECT HTML ELEMENTS
========================= */

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

const totalTasksElement = document.getElementById("total-tasks");
const activeTasksElement = document.getElementById("active-tasks");
const completedTasksElement = document.getElementById("completed-tasks");

const clearCompletedButton = document.getElementById(
    "clear-completed-btn"
);

const filterButtons = document.querySelectorAll(".filter-btn");


/* =========================
   2. APP STATE
========================= */

let tasks = [];

let currentFilter = "all";

const STORAGE_KEY = "taskflow-tasks";


/* =========================
   3. LOAD TASKS FROM STORAGE
========================= */

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks);

            if (Array.isArray(parsedTasks)) {
                tasks = parsedTasks.filter(task =>
                    task &&
                    typeof task.id === "string" &&
                    typeof task.text === "string" &&
                    typeof task.completed === "boolean"
                );
            }
        }
    } catch (error) {
        console.error("Could not load saved tasks:", error);
        tasks = [];
    }
}


/* =========================
   4. SAVE TASKS TO STORAGE
========================= */

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error("Could not save tasks:", error);
    }
}


/* =========================
   5. ADD A NEW TASK
========================= */

function addTask(event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    // Prevent empty tasks
    if (taskText === "") {
        taskInput.focus();
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskForm.reset();
    taskInput.focus();
}


/* =========================
   6. RENDER TASKS
========================= */

function renderTasks() {
    // Clear existing HTML before rendering
    taskList.replaceChildren();

    // Apply the selected filter
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    // Create an element for each task
    filteredTasks.forEach(task => {
        const taskItem = document.createElement("li");
        const taskCheckBox = document.createElement("input");
        const taskText = document.createElement("span");
        const taskDelBtn = document.createElement("button");

        // Task item
        taskItem.classList.add("task-item");
        taskItem.dataset.id = task.id;

        if (task.completed) {
            taskItem.classList.add("completed");
        }

        // Checkbox
        taskCheckBox.type = "checkbox";
        taskCheckBox.classList.add("task-checkbox");
        taskCheckBox.checked = task.completed;
        taskCheckBox.setAttribute(
            "aria-label",
            `Mark ${task.text} as completed`
        );

        // Task text
        taskText.classList.add("task-text");
        taskText.textContent = task.text;

        // Delete button
        taskDelBtn.type = "button";
        taskDelBtn.classList.add("delete-task-btn");
        taskDelBtn.textContent = "Delete";
        taskDelBtn.setAttribute(
            "aria-label",
            `Delete task: ${task.text}`
        );

        // Toggle completed status
        taskCheckBox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        // Delete task
        taskDelBtn.addEventListener("click", () => {
            deleteTask(task.id);
        });

        // Assemble task item
        taskItem.append(
            taskCheckBox,
            taskText,
            taskDelBtn
        );

        taskList.append(taskItem);
    });

    updateTaskSummary();

    // Show empty message when there are no visible tasks
    emptyMessage.classList.toggle(
        "hidden",
        filteredTasks.length > 0
    );

    if (filteredTasks.length === 0) {
        if (currentFilter === "active" && tasks.length > 0) {
            emptyMessage.textContent = "No active tasks!";
        } else if (
            currentFilter === "completed" &&
            tasks.length > 0
        ) {
            emptyMessage.textContent = "No completed tasks yet!";
        } else {
            emptyMessage.textContent =
                "No tasks yet. Add your first task!";
        }
    }
}


/* =========================
   7. TOGGLE TASK COMPLETION
========================= */

function toggleTask(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}


/* =========================
   8. DELETE A TASK
========================= */

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);

    saveTasks();
    renderTasks();
}


/* =========================
   9. UPDATE TASK COUNTERS
========================= */

function updateTaskSummary() {
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const active = total - completed;

    totalTasksElement.textContent = total;
    activeTasksElement.textContent = active;
    completedTasksElement.textContent = completed;
}


/* =========================
   10. FILTER TASKS
========================= */

function filterTasks(event) {
    const clickedButton = event.target.closest(".filter-btn");

    if (!clickedButton) {
        return;
    }

    currentFilter = clickedButton.dataset.filter;

    // Update active filter styling and accessibility
    filterButtons.forEach(button => {
        const isActive = button === clickedButton;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    renderTasks();
}


/* =========================
   11. CLEAR COMPLETED TASKS
========================= */

function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    renderTasks();
}


/* =========================
   12. EVENT LISTENERS
========================= */

// Handle form submission, including pressing Enter
taskForm.addEventListener("submit", addTask);

// Handle filter button clicks
document.querySelector(".task-filters").addEventListener(
    "click",
    filterTasks
);

// Clear all completed tasks
clearCompletedButton.addEventListener(
    "click",
    clearCompletedTasks
);


/* =========================
   13. INITIALIZE THE APP
========================= */

loadTasks();
renderTasks();
