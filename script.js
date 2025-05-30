// Todo App with Enhanced Features
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        this.taskIdCounter = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1;
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        // Get DOM elements
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addTaskBtn');
        this.tasksList = document.getElementById('tasksList');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.searchInput = document.getElementById('searchInput');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.emptyState = document.getElementById('emptyState');
        
        // Stats elements
        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.pendingTasksEl = document.getElementById('pendingTasks');
        
        // Bulk action buttons
        this.selectAllBtn = document.getElementById('selectAllBtn');
        this.deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');

        // Event listeners
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        this.searchInput.addEventListener('input', () => this.renderTasks());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        this.selectAllBtn.addEventListener('click', () => this.selectAll());
        this.deleteSelectedBtn.addEventListener('click', () => this.deleteSelected());
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        // Initial render
        this.renderTasks();
        this.updateStats();
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        if (taskText === '') {
            this.showToast('Please enter a task!', '⚠️');
            return;
        }

        const newTask = {
            id: this.taskIdCounter++,
            text: taskText,
            priority: this.prioritySelect.value,
            completed: false,
            selected: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.saveToLocalStorage();
        this.taskInput.value = '';
        this.prioritySelect.value = 'medium';
        this.renderTasks();
        this.updateStats();
        this.showToast('Task added successfully!', '✅');
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateStats();
            this.showToast(task.completed ? 'Task completed!' : 'Task marked as pending', '✅');
        }
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateStats();
            this.showToast('Task deleted!', '🗑️');
        }
    }

    toggleSelect(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.selected = !task.selected;
            this.updateDeleteSelectedBtn();
        }
    }

    selectAll() {
        const allSelected = this.tasks.every(t => t.selected);
        this.tasks.forEach(t => t.selected = !allSelected);
        this.renderTasks();
        this.updateDeleteSelectedBtn();
    }

    deleteSelected() {
        const selectedTasks = this.tasks.filter(t => t.selected);
        if (selectedTasks.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedTasks.length} selected task(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.selected);
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateStats();
            this.updateDeleteSelectedBtn();
            this.showToast(`${selectedTasks.length} task(s) deleted!`, '🗑️');
        }
    }

    clearCompleted() {
        const completedTasks = this.tasks.filter(t => t.completed);
        if (completedTasks.length === 0) {
            this.showToast('No completed tasks to clear!', '⚠️');
            return;
        }

        if (confirm(`Are you sure you want to clear ${completedTasks.length} completed task(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateStats();
            this.showToast(`${completedTasks.length} completed task(s) cleared!`, '🗑️');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.renderTasks();
    }

    renderTasks() {
        let filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.tasksList.style.display = 'none';
            this.emptyState.style.display = 'block';
            return;
        }

        this.tasksList.style.display = 'block';
        this.emptyState.style.display = 'none';
        
        this.tasksList.innerHTML = '';
        
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.tasksList.appendChild(taskElement);
        });

        this.updateDeleteSelectedBtn();
    }

    getFilteredTasks() {
        let filtered = this.tasks;
        
        // Apply status filter
        switch (this.currentFilter) {
            case 'pending':
                filtered = filtered.filter(t => !t.completed);
                break;
            case 'completed':
                filtered = filtered.filter(t => t.completed);
                break;
            case 'high':
                filtered = filtered.filter(t => t.priority === 'high');
                break;
        }
        
        // Apply search filter
        const searchTerm = this.searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(t => t.text.toLowerCase().includes(searchTerm));
        }
        
        return filtered;
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;
        
        const priorityIcon = {
            low: '🟢',
            medium: '🟡',
            high: '🔴'
        };

        taskDiv.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-select" ${task.selected ? 'checked' : ''} 
                       onchange="todoApp.toggleSelect(${task.id})">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="todoApp.toggleTask(${task.id})">
                <div class="task-info">
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <div class="task-meta">
                        <span class="task-priority">${priorityIcon[task.priority]} ${task.priority.toUpperCase()}</span>
                        <span class="task-date">${this.formatDate(task.createdAt)}</span>
                    </div>
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn" onclick="todoApp.editTask(${task.id})" title="Edit">
                    ✏️
                </button>
                <button class="delete-btn" onclick="todoApp.deleteTask(${task.id})" title="Delete">
                    🗑️
                </button>
            </div>
        `;
        
        return taskDiv;
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            this.saveToLocalStorage();
            this.renderTasks();
            this.showToast('Task updated!', '✏️');
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;

        this.totalTasksEl.textContent = total;
        this.completedTasksEl.textContent = completed;
        this.pendingTasksEl.textContent = pending;
    }

    updateDeleteSelectedBtn() {
        const selectedCount = this.tasks.filter(t => t.selected).length;
        this.deleteSelectedBtn.disabled = selectedCount === 0;
        this.deleteSelectedBtn.textContent = selectedCount > 0 ? `Delete Selected (${selectedCount})` : 'Delete Selected';
    }

    saveToLocalStorage() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, icon = '✅') {
        const toast = document.getElementById('toast');
        const toastIcon = toast.querySelector('.toast-icon');
        const toastMessage = toast.querySelector('.toast-message');
        
        toastIcon.textContent = icon;
        toastMessage.textContent = message;
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});
