
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
let deleting = false;
let loading = false;
let loadFailed = false;

// Keep all mutation controls consistent while a request is pending.
function setMutationControlsDisabled(disabled) {
  saveButton.disabled = disabled;
  cancelButton.disabled = disabled;

  projectList.querySelectorAll('button').forEach((button) => {
    button.disabled = disabled;
  });
}

// Send a request and report unsuccessful HTTP responses.
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

// Show the correct list state without confusing a failure with an empty list.
function updateListState() {
  if (loading) {
    emptyState.hidden = false;
    emptyState.textContent = 'Loading projects...';
    return;
  }

  if (loadFailed) {
    emptyState.hidden = true;
    return;
  }

  emptyState.hidden = projects.length > 0;
  emptyState.textContent = 'No projects added yet.';
}

// Read the saved projects from the server.
async function loadProjects() {
  loading = true;
  loadFailed = false;
  updateListState();
  message.textContent = 'Loading projects...';

  try {
    const data = await apiRequest(API_URL);

    if (!Array.isArray(data)) {
      throw new Error('The projects API did not return a list.');
    }

    projects = data;
    loadFailed = false;
    renderProjects();
    message.textContent = projects.length
      ? 'Projects loaded successfully.'
      : 'No projects found yet. Add your first project.';
    return true;
  } catch (error) {
    loadFailed = true;
    message.textContent = `Could not load projects: ${error.message}`;
    updateListState();
    return false;
  } finally {
    loading = false;
    updateListState();
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
    status.textContent = `Status: ${project.status}`;

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.disabled = submitting || deleting;

    editButton.addEventListener('click', function () {
      if (submitting || deleting) return;

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
    deleteButton.disabled = submitting || deleting;

    deleteButton.addEventListener('click', async function () {
      if (submitting || deleting) return;

      const confirmed = window.confirm(
        `Are you sure you want to delete "${project.name}"?`
      );

      if (!confirmed || submitting || deleting) return;

      deleting = true;
      setMutationControlsDisabled(true);
      message.textContent = 'Deleting project...';

      try {
        await apiRequest(`${API_URL}/${project.id}`, {
          method: 'DELETE'
        });

        if (editingId === project.id) {
          resetForm();
        }

        const refreshed = await loadProjects();

        if (refreshed) {
          message.textContent = 'Project deleted successfully.';
        } else {
          message.textContent =
            'Project deleted, but the project list could not refresh. Reload the page to check the latest list.';
        }
      } catch (error) {
        message.textContent = `Could not delete project: ${error.message}`;
      } finally {
        deleting = false;
        setMutationControlsDisabled(false);
      }
    });

    item.append(name, status, editButton, deleteButton);
    projectList.append(item);
  }

  updateListState();
}

// Create a project or update the selected project.
form.addEventListener('submit', async function (event) {
  event.preventDefault();

  if (submitting || deleting) return;

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
  setMutationControlsDisabled(true);
  saveButton.textContent = editingId !== null ? 'Saving changes...' : 'Saving...';
  message.textContent = 'Saving project...';

  try {
    const wasEditing = editingId !== null;
    const url = wasEditing ? `${API_URL}/${editingId}` : API_URL;

    await apiRequest(url, {
      method: wasEditing ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, status })
    });

    // Reset only after the server confirms that the save succeeded.
    resetForm();

    const refreshed = await loadProjects();

    if (refreshed) {
      message.textContent = wasEditing
        ? 'Project updated and saved successfully.'
        : 'Project added and saved successfully.';
    } else {
      message.textContent =
        'Project saved successfully, but the list could not refresh. Reload the page to check the saved data.';
    }

    if (refreshed) {
      nameInput.focus();
    }
  } catch (error) {
    // Do not reset the form: preserve the user's unsaved values.
    message.textContent = `Could not save project: ${error.message}`;
  } finally {
    submitting = false;
    saveButton.textContent = editingId !== null
      ? 'Save changes'
      : 'Add Project';
    setMutationControlsDisabled(false);
  }
});

// Cancel editing without modifying the saved project.
cancelButton.addEventListener('click', function () {
  if (submitting || deleting) return;

  resetForm();
  message.textContent = 'Edit cancelled.';
  nameInput.focus();
});

// Load saved projects when the page opens.
loadProjects();
