const API = '/api/tasks/';

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}
const csrftoken = getCookie('csrftoken');

let allTasks = [];

async function fetchTasks() {
  const res = await fetch(API, { credentials: 'same-origin' });
  allTasks = await res.json();
  renderTasks(allTasks);
  updateTicker(allTasks);
}

function updateTicker(tasks) {
  document.getElementById('stat-pending').textContent = tasks.filter(t => t.status === 'Pending').length;
  document.getElementById('stat-progress').textContent = tasks.filter(t => t.status === 'In Progress').length;
  document.getElementById('stat-done').textContent = tasks.filter(t => t.status === 'Done').length;
}

function renderTasks(tasks) {
  const list = document.getElementById('taskList');
  if (tasks.length === 0) {
    list.innerHTML = `<p class="mono" style="color: var(--muted);">No entries yet. Add your first one.</p>`;
    return;
  }
  list.innerHTML = tasks.map(t => `
    <div class="task-card priority-${t.priority}">
      <div>
        <div class="task-card__title">${t.title}</div>
        <div class="task-card__meta">${t.priority} priority ${t.due_date ? '· due ' + t.due_date : ''}</div>
      </div>
      <div style="display:flex; align-items:center;">
        <span class="badge-status badge-${t.status.replace(' ', '-')}">${t.status}</span>
        <div class="task-card__actions">
          <button onclick="editTask(${t.id})">Edit</button>
          <button onclick="deleteTask(${t.id})">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function editTask(id) {
  const t = allTasks.find(x => x.id === id);
  document.getElementById('modalTitle').textContent = 'Edit entry';
  document.getElementById('taskId').value = t.id;
  document.getElementById('taskTitle').value = t.title;
  document.getElementById('taskDescription').value = t.description;
  document.getElementById('taskPriority').value = t.priority;
  document.getElementById('taskStatus').value = t.status;
  document.getElementById('taskDueDate').value = t.due_date || '';
  new bootstrap.Modal(document.getElementById('taskModal')).show();
}

async function deleteTask(id) {
  if (!confirm('Delete this entry?')) return;
  await fetch(`${API}${id}/`, {
    method: 'DELETE',
    headers: { 'X-CSRFToken': csrftoken },
    credentials: 'same-origin'
  });
  fetchTasks();
}

document.getElementById('saveTaskBtn').addEventListener('click', async () => {
  const id = document.getElementById('taskId').value;
  const payload = {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    priority: document.getElementById('taskPriority').value,
    status: document.getElementById('taskStatus').value,
    due_date: document.getElementById('taskDueDate').value || null,
  };

  const url = id ? `${API}${id}/` : API;
  const method = id ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
    credentials: 'same-origin',
    body: JSON.stringify(payload)
  });

  bootstrap.Modal.getInstance(document.getElementById('taskModal')).hide();
  document.getElementById('taskId').value = '';
  document.querySelector('#taskModal form')?.reset();
  fetchTasks();
});

document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('statusFilter').addEventListener('change', applyFilters);
document.getElementById('priorityFilter').addEventListener('change', applyFilters);

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const priority = document.getElementById('priorityFilter').value;

  const filtered = allTasks.filter(t =>
    t.title.toLowerCase().includes(search) &&
    (status === '' || t.status === status) &&
    (priority === '' || t.priority === priority)
  );
  renderTasks(filtered);
}

fetchTasks();