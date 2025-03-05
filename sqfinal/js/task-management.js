// Task Management and Reminder System

// Task management state
const taskState = {
    tasks: [],
    reminders: [],
    events: [],
    lastTaskId: 0
};

// Task validation schema
const taskValidationSchema = {
    title: (value) => value && value.trim().length > 0 ? null : 'عنوان المهمة مطلوب',
    description: () => null, // Optional field
    dueDate: (value) => value ? null : 'تاريخ الاستحقاق مطلوب',
    priority: (value) => ['low', 'medium', 'high'].includes(value) ? null : 'الأولوية غير صالحة',
    assignedTo: (value) => value && value.trim().length > 0 ? null : 'يجب تعيين المهمة لموظف'
};

// Load task management system UI
function loadTaskManagementSystem() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="container-fluid">
            <div class="row mb-4">
                <div class="col-12">
                    <h3 class="mb-3">نظام التذكيرات والمهام</h3>
                    <ul class="nav nav-tabs" id="taskTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="tasks-tab" data-bs-toggle="tab" 
                                    data-bs-target="#tasks" type="button" role="tab">
                                <i class="fas fa-tasks me-2"></i>المهام
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="calendar-tab" data-bs-toggle="tab" 
                                    data-bs-target="#calendar" type="button" role="tab">
                                <i class="fas fa-calendar-alt me-2"></i>التقويم
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="reminders-tab" data-bs-toggle="tab" 
                                    data-bs-target="#reminders" type="button" role="tab">
                                <i class="fas fa-bell me-2"></i>التذكيرات
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="tab-content" id="taskTabContent">
                <!-- Tasks Tab -->
                <div class="tab-pane fade show active" id="tasks" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-12 d-flex justify-content-end">
                            <button class="btn btn-primary" onclick="showAddTaskModal()">
                                <i class="fas fa-plus me-2"></i>إضافة مهمة جديدة
                            </button>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-header bg-light">
                                    <div class="row">
                                        <div class="col-md-3 fw-bold">عنوان المهمة</div>
                                        <div class="col-md-2 fw-bold">تاريخ الاستحقاق</div>
                                        <div class="col-md-2 fw-bold">الأولوية</div>
                                        <div class="col-md-2 fw-bold">معين إلى</div>
                                        <div class="col-md-1 fw-bold">الحالة</div>
                                        <div class="col-md-2 fw-bold">الإجراءات</div>
                                    </div>
                                </div>
                                <div class="card-body p-0">
                                    <div id="tasks-list" class="task-list">
                                        <!-- Tasks will be loaded here -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Calendar Tab -->
                <div class="tab-pane fade" id="calendar" role="tabpanel">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-body">
                                    <div id="task-calendar" class="calendar-container">
                                        <!-- Calendar will be loaded here -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Reminders Tab -->
                <div class="tab-pane fade" id="reminders" role="tabpanel">
                    <div class="row mb-3">
                        <div class="col-md-12 d-flex justify-content-end">
                            <button class="btn btn-primary" onclick="showAddReminderModal()">
                                <i class="fas fa-plus me-2"></i>إضافة تذكير جديد
                            </button>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-header bg-light">
                                    <div class="row">
                                        <div class="col-md-4 fw-bold">عنوان التذكير</div>
                                        <div class="col-md-3 fw-bold">التاريخ والوقت</div>
                                        <div class="col-md-3 fw-bold">معين إلى</div>
                                        <div class="col-md-2 fw-bold">الإجراءات</div>
                                    </div>
                                </div>
                                <div class="card-body p-0">
                                    <div id="reminders-list" class="reminder-list">
                                        <!-- Reminders will be loaded here -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Add Task Modal -->
        <div class="modal fade" id="addTaskModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">إضافة مهمة جديدة</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="add-task-form">
                            <div class="mb-3">
                                <label for="task-title" class="form-label">عنوان المهمة</label>
                                <input type="text" class="form-control" id="task-title" required>
                            </div>
                            <div class="mb-3">
                                <label for="task-description" class="form-label">وصف المهمة</label>
                                <textarea class="form-control" id="task-description" rows="3"></textarea>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="task-due-date" class="form-label">تاريخ الاستحقاق</label>
                                    <input type="date" class="form-control" id="task-due-date" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="task-priority" class="form-label">الأولوية</label>
                                    <select class="form-select" id="task-priority" required>
                                        <option value="low">منخفضة</option>
                                        <option value="medium" selected>متوسطة</option>
                                        <option value="high">عالية</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="task-assigned-to" class="form-label">تعيين إلى</label>
                                <select class="form-select" id="task-assigned-to" required>
                                    <!-- Employee options will be loaded here -->
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                        <button type="button" class="btn btn-primary" onclick="addNewTask()">إضافة المهمة</button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Add Reminder Modal -->
        <div class="modal fade" id="addReminderModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">إضافة تذكير جديد</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="add-reminder-form">
                            <div class="mb-3">
                                <label for="reminder-title" class="form-label">عنوان التذكير</label>
                                <input type="text" class="form-control" id="reminder-title" required>
                            </div>
                            <div class="mb-3">
                                <label for="reminder-message" class="form-label">رسالة التذكير</label>
                                <textarea class="form-control" id="reminder-message" rows="2"></textarea>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="reminder-date" class="form-label">التاريخ</label>
                                    <input type="date" class="form-control" id="reminder-date" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="reminder-time" class="form-label">الوقت</label>
                                    <input type="time" class="form-control" id="reminder-time" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="reminder-assigned-to" class="form-label">تعيين إلى</label>
                                <select class="form-select" id="reminder-assigned-to" required>
                                    <!-- Employee options will be loaded here -->
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                        <button type="button" class="btn btn-primary" onclick="addNewReminder()">إضافة التذكير</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load data and initialize components
    loadTaskData();
    populateEmployeeDropdowns();
    initializeCalendar();
    checkForDueTasks();
}

// Load saved task data
function loadTaskData() {
    const savedTasks = localStorage.getItem('tasks');
    const savedReminders = localStorage.getItem('reminders');
    const savedEvents = localStorage.getItem('events');
    const savedLastTaskId = localStorage.getItem('lastTaskId');
    
    if (savedTasks) taskState.tasks = JSON.parse(savedTasks);
    if (savedReminders) taskState.reminders = JSON.parse(savedReminders);
    if (savedEvents) taskState.events = JSON.parse(savedEvents);
    if (savedLastTaskId) taskState.lastTaskId = parseInt(savedLastTaskId);
    
    renderTasksList();
    renderRemindersList();
}

// Save task data to Supabase via API
async function saveTaskData() {
    try {
        // For each task, save it to the database
        for (const task of taskState.tasks) {
            // If the task has an id from Supabase, update it, otherwise create it
            if (task.id && !isNaN(parseInt(task.id))) {
                await fetch(`/api/tasks/${task.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        employeeId: task.assignedTo,
                        title: task.title,
                        description: task.description,
                        status: task.status,
                        priority: task.priority,
                        dueDate: task.dueDate
                    })
                });
            } else {
                const response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        employeeId: task.assignedTo,
                        title: task.title,
                        description: task.description,
                        status: task.status || 'pending',
                        priority: task.priority || 'medium',
                        dueDate: task.dueDate
                    })
                });
                
                if (response.ok) {
                    const newTask = await response.json();
                    // Update the task in our local state with the ID from the database
                    task.id = newTask.id;
                }
            }
        }
        
        // For backward compatibility, still save to localStorage as a fallback
        localStorage.setItem('tasks', JSON.stringify(taskState.tasks));
        localStorage.setItem('reminders', JSON.stringify(taskState.reminders));
        localStorage.setItem('events', JSON.stringify(taskState.events));
        localStorage.setItem('lastTaskId', taskState.lastTaskId.toString());
        
    } catch (error) {
        console.error('Error saving task data to Supabase:', error);
        showAlert('حدث خطأ أثناء حفظ بيانات المهام في قاعدة البيانات', 'danger');
    }
}

// Populate employee dropdowns
function populateEmployeeDropdowns() {
    const employees = appState.employees || [];
    const taskAssignedTo = document.getElementById('task-assigned-to');
    const reminderAssignedTo = document.getElementById('reminder-assigned-to');
    
    if (taskAssignedTo) {
        taskAssignedTo.innerHTML = '';
        employees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.code;
            option.textContent = employee.name;
            taskAssignedTo.appendChild(option);
        });
    }
    
    if (reminderAssignedTo) {
        reminderAssignedTo.innerHTML = '';
        employees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.code;
            option.textContent = employee.name;
            reminderAssignedTo.appendChild(option);
        });
    }
}

// Show add task modal
function showAddTaskModal() {
    const modal = new bootstrap.Modal(document.getElementById('addTaskModal'));
    modal.show();
}

// Show add reminder modal
function showAddReminderModal() {
    const modal = new bootstrap.Modal(document.getElementById('addReminderModal'));
    modal.show();
}

// Add new task
function addNewTask() {
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;
    const assignedTo = document.getElementById('task-assigned-to').value;
    
    // Validate form
    let isValid = true;
    Object.keys(taskValidationSchema).forEach(field => {
        const value = eval(field); // Get the value of the field
        const error = taskValidationSchema[field](value);
        if (error) {
            isValid = false;
            showAlert(error, 'danger');
        }
    });
    
    if (!isValid) return;
    
    // Create new task
    const newTask = {
        id: ++taskState.lastTaskId,
        title,
        description,
        dueDate,
        priority,
        assignedTo,
        status: 'pending',
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    
    // Add to tasks array
    taskState.tasks.push(newTask);
    
    // Add to events array for calendar
    taskState.events.push({
        id: `task-${newTask.id}`,
        title: newTask.title,
        start: newTask.dueDate,
        allDay: true,
        className: `priority-${newTask.priority}`,
        extendedProps: {
            type: 'task',
            taskId: newTask.id
        }
    });
    
    // Save data
    saveTaskData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
    modal.hide();
    
    // Refresh UI
    renderTasksList();
    refreshCalendar();
    
    showAlert('تمت إضافة المهمة بنجاح', 'success');
}

// Add new reminder
function addNewReminder() {
    const title = document.getElementById('reminder-title').value;
    const message = document.getElementById('reminder-message').value;
    const date = document.getElementById('reminder-date').value;
    const time = document.getElementById('reminder-time').value;
    const assignedTo = document.getElementById('reminder-assigned-to').value;
    
    if (!title || !date || !time || !assignedTo) {
        showAlert('جميع الحقول المطلوبة يجب ملؤها', 'danger');
        return;
    }
    
    // Create datetime string
    const dateTime = `${date}T${time}`;
    
    // Create new reminder
    const newReminder = {
        id: ++taskState.lastTaskId,
        title,
        message,
        dateTime,
        assignedTo,
        isActive: true,
        createdAt: new Date().toISOString()
    };
    
    // Add to reminders array
    taskState.reminders.push(newReminder);
    
    // Add to events array for calendar
    taskState.events.push({
        id: `reminder-${newReminder.id}`,
        title: newReminder.title,
        start: newReminder.dateTime,
        allDay: false,
        className: 'reminder-event',
        extendedProps: {
            type: 'reminder',
            reminderId: newReminder.id
        }
    });
    
    // Save data
    saveTaskData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addReminderModal'));
    modal.hide();
    
    // Refresh UI
    renderRemindersList();
    refreshCalendar();
    
    showAlert('تم إضافة التذكير بنجاح', 'success');
}

// Render tasks list
function renderTasksList() {
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;
    
    if (taskState.tasks.length === 0) {
        tasksList.innerHTML = '<div class="p-3 text-center text-muted">لا توجد مهام حالياً</div>';
        return;
    }
    
    // Sort tasks by due date (closest first) and then by priority
    const sortedTasks = [...taskState.tasks].sort((a, b) => {
        // First sort by status (pending first)
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        
        // Then sort by due date
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        
        // Then by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    tasksList.innerHTML = sortedTasks.map(task => {
        const employee = appState.employees.find(emp => emp.code === task.assignedTo) || { name: 'غير معروف' };
        const isPastDue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
        
        return `
            <div class="task-item p-3 border-bottom ${isPastDue ? 'past-due' : ''}">
                <div class="row align-items-center">
                    <div class="col-md-3">
                        <div class="d-flex align-items-center">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" 
                                    ${task.status === 'completed' ? 'checked' : ''}
                                    onchange="toggleTaskStatus(${task.id}, this.checked)">
                            </div>
                            <span class="ms-2 ${task.status === 'completed' ? 'text-decoration-line-through' : ''}">
                                ${task.title}
                            </span>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <span class="${isPastDue ? 'text-danger' : ''}">
                            ${formatDate(task.dueDate)}
                        </span>
                    </div>
                    <div class="col-md-2">
                        <span class="badge bg-${getPriorityBadgeColor(task.priority)}">
                            ${getPriorityLabel(task.priority)}
                        </span>
                    </div>
                    <div class="col-md-2">
                        ${employee.name}
                    </div>
                    <div class="col-md-1">
                        <span class="badge bg-${task.status === 'completed' ? 'success' : 'warning'}">
                            ${task.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}
                        </span>
                    </div>
                    <div class="col-md-2">
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="editTask(${task.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="deleteTask(${task.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Render reminders list
function renderRemindersList() {
    const remindersList = document.getElementById('reminders-list');
    if (!remindersList) return;
    
    if (taskState.reminders.length === 0) {
        remindersList.innerHTML = '<div class="p-3 text-center text-muted">لا توجد تذكيرات حالياً</div>';
        return;
    }
    
    // Sort reminders by date (closest first)
    const sortedReminders = [...taskState.reminders].sort((a, b) => {
        const dateA = new Date(a.dateTime);
        const dateB = new Date(b.dateTime);
        return dateA - dateB;
    });
    
    remindersList.innerHTML = sortedReminders.map(reminder => {
        const employee = appState.employees.find(emp => emp.code === reminder.assignedTo) || { name: 'غير معروف' };
        const isPastDue = new Date(reminder.dateTime) < new Date();
        
        return `
            <div class="reminder-item p-3 border-bottom ${isPastDue ? 'past-due' : ''}">
                <div class="row align-items-center">
                    <div class="col-md-4">
                        <span class="${!reminder.isActive ? 'text-decoration-line-through' : ''}">
                            ${reminder.title}
                        </span>
                    </div>
                    <div class="col-md-3">
                        <span class="${isPastDue ? 'text-danger' : ''}">
                            ${formatDateTime(reminder.dateTime)}
                        </span>
                    </div>
                    <div class="col-md-3">
                        ${employee.name}
                    </div>
                    <div class="col-md-2">
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-${reminder.isActive ? 'secondary' : 'success'}" 
                                    onclick="toggleReminderStatus(${reminder.id})">
                                <i class="fas ${reminder.isActive ? 'fa-bell-slash' : 'fa-bell'}"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="deleteReminder(${reminder.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Initialize calendar
function initializeCalendar() {
    const calendarEl = document.getElementById('task-calendar');
    if (!calendarEl) return;
    
    // Load FullCalendar library if not already loaded
    if (typeof FullCalendar === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@5.10.1/main.min.js';
        script.onload = () => {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@5.10.1/main.min.css';
            document.head.appendChild(cssLink);
            
            // Initialize after library is loaded
            initializeCalendarInstance();
        };
        document.head.appendChild(script);
    } else {
        initializeCalendarInstance();
    }
}

// Initialize calendar instance
function initializeCalendarInstance() {
    const calendarEl = document.getElementById('task-calendar');
    if (!calendarEl) return;
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        locale: 'ar',
        direction: 'rtl',
        events: taskState.events,
        eventClick: function(info) {
            const eventType = info.event.extendedProps.type;
            const itemId = eventType === 'task' ? 
                info.event.extendedProps.taskId : 
                info.event.extendedProps.reminderId;
            
            if (eventType === 'task') {
                showTaskDetails(itemId);
            } else {
                showReminderDetails(itemId);
            }
        },
        eventClassNames: function(arg) {
            // Add custom classes based on priority or type
            return [];
        }
    });
    
    calendar.render();
    taskState.calendar = calendar;
}

// Refresh calendar
function refreshCalendar() {
    if (taskState.calendar) {
        taskState.calendar.getEvents().forEach(event => event.remove());
        taskState.events.forEach(event => taskState.calendar.addEvent(event));
    }
}

// Toggle task status
function toggleTaskStatus(taskId, isCompleted) {
    const task = taskState.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.status = isCompleted ? 'completed' : 'pending';
    task.completedAt = isCompleted ? new Date().toISOString() : null;
    
    saveTaskData();
    renderTasksList();
    refreshCalendar();
}

// Toggle reminder status
function toggleReminderStatus(reminderId) {
    const reminder = taskState.reminders.find(r => r.id === reminderId);
    if (!reminder) return;
    
    reminder.isActive = !reminder.isActive;
    
    saveTaskData();
    renderRemindersList();
    refreshCalendar();
}

// Delete task
function deleteTask(taskId) {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
    
    taskState.tasks = taskState.tasks.filter(t => t.id !== taskId);
    taskState.events = taskState.events.filter(e => !(e.extendedProps && e.extendedProps.type === 'task' && e.extendedProps.taskId === taskId));
    
    saveTaskData();
    renderTasksList();
    refreshCalendar();
}

// Delete reminder
function deleteReminder(reminderId) {
    if (!confirm('هل أنت متأكد من حذف هذا التذكير؟')) return;
    
    taskState.reminders = taskState.reminders.filter(r => r.id !== reminderId);
    taskState.events = taskState.events.filter(e => !(e.extendedProps && e.extendedProps.type === 'reminder' && e.extendedProps.reminderId === reminderId));
    
    saveTaskData();
    renderRemindersList();
    refreshCalendar();
}

// Edit task
function editTask(taskId) {
    const task = taskState.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Populate modal with task data
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-due-date').value = task.dueDate;
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-assigned-to').value = task.assignedTo;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addTaskModal'));
    modal.show();
    
    // Replace add button with update button
    const modalFooter = document.querySelector('#addTaskModal .modal-footer');
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
        <button type="button" class="btn btn-primary" onclick="updateTask(${taskId})">تحديث المهمة</button>
    `;
}

// Update task
function updateTask(taskId) {
    const task = taskState.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('task-due-date').value;
    const priority = document.getElementById('task-priority').value;
    const assignedTo = document.getElementById('task-assigned-to').value;
    
    // Validate form
    let isValid = true;
    Object.keys(taskValidationSchema).forEach(field => {
        const value = eval(field); // Get the value of the field
        const error = taskValidationSchema[field](value);
        if (error) {
            isValid = false;
            showAlert(error, 'danger');
        }
    });
    
    if (!isValid) return;
    
    // Update task
    task.title = title;
    task.description = description;
    task.dueDate = dueDate;
    task.priority = priority;
    task.assignedTo = assignedTo;
    
    // Update event
    const eventIndex = taskState.events.findIndex(e => 
        e.extendedProps && e.extendedProps.type === 'task' && e.extendedProps.taskId === taskId
    );
    
    if (eventIndex !== -1) {
        taskState.events[eventIndex].title = title;
        taskState.events[eventIndex].start = dueDate;
        taskState.events[eventIndex].className = `priority-${priority}`;
    }
    
    // Save data
    saveTaskData();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
    modal.hide();
    
    // Refresh UI
    renderTasksList();
    refreshCalendar();
    
    showAlert('تم تحديث المهمة بنجاح', 'success');
}

// Show task details
function showTaskDetails(taskId) {
    const task = taskState.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const employee = appState.employees.find(emp => emp.code === task.assignedTo) || { name: 'غير معروف' };
    
    // Create modal for task details
    const modalHtml = `
        <div class="modal fade" id="taskDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">تفاصيل المهمة</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h4>${task.title}</h4>
                        <p class="text-muted">${task.description || 'لا يوجد وصف'}</p>
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <p><strong>تاريخ الاستحقاق:</strong> ${formatDate(task.dueDate)}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>الأولوية:</strong> 
                                    <span class="badge bg-${getPriorityBadgeColor(task.priority)}">
                                        ${getPriorityLabel(task.priority)}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>معين إلى:</strong> ${employee.name}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>الحالة:</strong> 
                                    <span class="badge bg-${task.status === 'completed' ? 'success' : 'warning'}">
                                        ${task.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}
                                    </span>
                                </p>
                            </div>
                        </div>
                        ${task.completedAt ? `
                            <div class="row">
                                <div class="col-md-12">
                                    <p><strong>تاريخ الإكمال:</strong> ${formatDateTime(task.completedAt)}</p>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                        <button type="button" class="btn btn-primary" onclick="editTask(${task.id})" data-bs-dismiss="modal">تعديل</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('taskDetailsModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('taskDetailsModal').addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(modalContainer);
    });
}

// Show reminder details
function showReminderDetails(reminderId) {
    const reminder = taskState.reminders.find(r => r.id === reminderId);
    if (!reminder) return;
    
    const employee = appState.employees.find(emp => emp.code === reminder.assignedTo) || { name: 'غير معروف' };
    
    // Create modal for reminder details
    const modalHtml = `
        <div class="modal fade" id="reminderDetailsModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">تفاصيل التذكير</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h4>${reminder.title}</h4>
                        <p class="text-muted">${reminder.message || 'لا توجد رسالة'}</p>
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <p><strong>التاريخ والوقت:</strong> ${formatDateTime(reminder.dateTime)}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>معين إلى:</strong> ${employee.name}</p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>الحالة:</strong> 
                                    <span class="badge bg-${reminder.isActive ? 'info' : 'secondary'}">
                                        ${reminder.isActive ? 'نشط' : 'غير نشط'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                        <button type="button" class="btn btn-${reminder.isActive ? 'warning' : 'success'}" 
                                onclick="toggleReminderStatus(${reminder.id}); document.getElementById('reminderDetailsModal').querySelector('.btn-close').click();">
                            ${reminder.isActive ? 'إيقاف التذكير' : 'تنشيط التذكير'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('reminderDetailsModal'));
    modal.show();
    
    // Remove modal from DOM when hidden
    document.getElementById('reminderDetailsModal').addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(modalContainer);
    });
}

// Check for due tasks and reminders
function checkForDueTasks() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check for tasks due today or tomorrow
    const dueTasks = taskState.tasks.filter(task => {
        if (task.status === 'completed') return false;
        const dueDate = new Date(task.dueDate);
        return dueDate.toDateString() === now.toDateString() || dueDate.toDateString() === tomorrow.toDateString();
    });
    
    // Check for active reminders due within the next hour
    const dueReminders = taskState.reminders.filter(reminder => {
        if (!reminder.isActive) return false;
        const reminderTime = new Date(reminder.dateTime);
        const oneHourLater = new Date(now);
        oneHourLater.setHours(oneHourLater.getHours() + 1);
        return reminderTime >= now && reminderTime <= oneHourLater;
    });
    
    // Show notifications for due tasks and reminders
    if (dueTasks.length > 0 || dueReminders.length > 0) {
        let notificationHtml = '<div class="task-notifications">';
        
        if (dueTasks.length > 0) {
            notificationHtml += `
                <div class="notification-section">
                    <h5>مهام مستحقة قريباً (${dueTasks.length})</h5>
                    <ul class="list-group">
                        ${dueTasks.map(task => `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                ${task.title}
                                <span class="badge bg-${task.dueDate === now.toDateString() ? 'danger' : 'warning'} rounded-pill">
                                    ${task.dueDate === now.toDateString() ? 'اليوم' : 'غداً'}
                                </span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (dueReminders.length > 0) {
            notificationHtml += `
                <div class="notification-section mt-3">
                    <h5>تذكيرات قريبة (${dueReminders.length})</h5>
                    <ul class="list-group">
                        ${dueReminders.map(reminder => `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                ${reminder.title}
                                <span class="badge bg-info rounded-pill">
                                    ${formatTime(reminder.dateTime)}
                                </span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        notificationHtml += '</div>';
        
        // Show notification
        showNotification('تذكير بالمهام والمواعيد', notificationHtml);
    }
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function getPriorityLabel(priority) {
    const labels = {
        low: 'منخفضة',
        medium: 'متوسطة',
        high: 'عالية'
    };
    return labels[priority] || priority;
}

function getPriorityBadgeColor(priority) {
    const colors = {
        low: 'success',
        medium: 'warning',
        high: 'danger'
    };
    return colors[priority] || 'secondary';
}

// Show notification
function showNotification(title, content) {
    // Check if notification container exists
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-header">
            <h5>${title}</h5>
            <button type="button" class="btn-close" onclick="this.parentNode.parentNode.remove()"></button>
        </div>
        <div class="notification-body">
            ${content}
        </div>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 10000);
}

// Show alert
function showAlert(message, type = 'info') {
    // Create alert container if it doesn't exist
    let alertContainer = document.getElementById('alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.className = 'alert-container';
        document.body.appendChild(alertContainer);
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to container
    alertContainer.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}