const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const formTitle = document.querySelector('#form-title');
const message = document.querySelector('#message');

const API_URL = '/api/projects';
const validStatuses = ['Planned', 'In Progress', 'Completed'];

let projects = [];
let editingId = null;
let submitting = false;

// Send a request to the server and handle API errors.
async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || `Request failed with status ${response.status}.`
    );
  }

  return data;
}

// Read projects from SQLite through the API.
async function loadProjects() {
  try {
    const data = await apiRequest(API_URL);

    if (!Array.isArray(data)) {
      throw new Error('The projects API did not return a list.');
    }

    projects = data;
    renderProjects();
  } catch (error) {
    message.textContent = `Could not load projects: ${error.message}`;
  }
}

function resetForm() {
  form.reset();
  editingId = null;
  saveButton.textContent = 'Add Project';
  cancelButton.hidden = true;
  formTitle.textContent = 'Add a Project';
}

function renderProjects() {
  projectList.replaceChildren();

  for (const project of projects) {
    const item = document.createElement('li');

    const name = document.createElement('h3');
    name.textContent = project.name;

    const status = document.createElement('p');
    status.textContent = 'Status: ' + project.status;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';

    editButton.addEventListener('click', function () {
      editingId = project.id;

      nameInput.value = project.name;
      statusInput.value = project.status;

      saveButton.textContent = 'Save changes';
      cancelButton.hidden = false;
      formTitle.textContent = 'Edit Project';

      message.textContent = '';
      nameInput.focus();
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';

    deleteButton.addEventListener('click', async function () {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${project.name}"?`
      );

      if (!confirmed) {
        return;
      }

      deleteButton.disabled = true;
      message.textContent = '';

      try {
        await apiRequest(`${API_URL}/${project.id}`, {
          method: 'DELETE'
        });

        if (editingId === project.id) {
          resetForm();
        }

        await loadProjects();
        message.textContent = 'Project deleted successfully.';
      } catch (error) {
        message.textContent = `Could not delete project: ${error.message}`;
        deleteButton.disabled = false;
      }
    });

    item.append(name, status, editButton, deleteButton);
    projectList.appendChild(item);
  }

  if (emptyState) {
    emptyState.hidden = projects.length > 0;
  }
}

// Create a project or update the selected project.
form.addEventListener('submit', async function (event) {
  event.preventDefault();

  if (submitting) {
    return;
  }

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    message.textContent = 'Please enter a project name.';
    nameInput.focus();
    return;
  }

  if (name.length > 80) {
    message.textContent = 'Project name must be 80 characters or fewer.';
    nameInput.focus();
    return;
  }

  if (!validStatuses.includes(status)) {
    message.textContent = 'Please select a valid project status.';
    statusInput.focus();
    return;
  }

  submitting = true;
  saveButton.disabled = true;
  message.textContent = '';

  try {
    const wasEditing = editingId !== null;

    if (wasEditing) {
      await apiRequest(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, status })
      });
    } else {
      await apiRequest(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, status })
      });
    }

    resetForm();
    await loadProjects();

    message.textContent = wasEditing
      ? 'Project updated and saved.'
      : 'Project added and saved.';

    nameInput.focus();
  } catch (error) {
    message.textContent = `Could not save project: ${error.message}`;
  } finally {
    submitting = false;
    saveButton.disabled = false;
  }
});

// Cancel editing without changing the stored project.
cancelButton.addEventListener('click', function () {
  resetForm();
  message.textContent = 'Edit cancelled.';
  nameInput.focus();
});

// Load the server's records when the page opens.
loadProjects();